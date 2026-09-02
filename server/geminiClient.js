import {
  CONTINUED_REFLECTION_SYSTEM_INSTRUCTION,
  createContinuedReflectionInput,
  createReflectionInput,
  REFLECTION_SYSTEM_INSTRUCTION,
} from './reflectionPrompt.js'

const GEMINI_API_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-3-flash-preview'
const REQUEST_TIMEOUT_MS = 30000
const RETRY_DELAY_MS = 750
const MAX_REQUEST_ATTEMPTS = 2
const RETRYABLE_PROVIDER_STATUSES = new Set([500, 502, 503, 504])

const responseSchema = {
  type: 'OBJECT',
  properties: {
    reflection: {
      type: 'STRING',
      description:
        'A concise and tentative reflection using only details supplied in the memory.',
    },
    limitation: {
      type: 'STRING',
      description:
        'One concise statement about a relevant thing the model cannot know from the memory.',
    },
    question: {
      type: 'STRING',
      description:
        'One gentle and specific sensory, embodied, or family-focused question.',
    },
  },
  required: ['reflection', 'limitation', 'question'],
}

const fieldLimits = {
  reflection: 700,
  limitation: 500,
  question: 300,
}

function createGeminiError(code, providerStatus) {
  const error = new Error(code)
  error.code = code
  error.providerStatus = providerStatus
  return error
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function requestGemini(apiUrl, apiKey, requestBody) {
  for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt += 1) {
    let response

    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: requestBody,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
    } catch {
      if (attempt < MAX_REQUEST_ATTEMPTS) {
        await wait(RETRY_DELAY_MS)
        continue
      }

      throw createGeminiError('MODEL_UNAVAILABLE')
    }

    if (
      RETRYABLE_PROVIDER_STATUSES.has(response.status) &&
      attempt < MAX_REQUEST_ATTEMPTS
    ) {
      await wait(RETRY_DELAY_MS)
      continue
    }

    return response
  }

  throw createGeminiError('MODEL_UNAVAILABLE')
}

function extractOutputText(payload) {
  const textOutput = payload?.candidates?.[0]?.content?.parts?.find(
    (part) => typeof part.text === 'string',
  )

  if (textOutput) {
    return textOutput.text
  }

  throw createGeminiError('INVALID_MODEL_RESPONSE')
}

function validateReflection(responseText) {
  let reflection

  try {
    reflection = JSON.parse(responseText)
  } catch {
    throw createGeminiError('INVALID_MODEL_RESPONSE')
  }

  if (!reflection || typeof reflection !== 'object' || Array.isArray(reflection)) {
    throw createGeminiError('INVALID_MODEL_RESPONSE')
  }

  const validatedReflection = {}

  for (const [field, limit] of Object.entries(fieldLimits)) {
    const value = reflection[field]

    if (typeof value !== 'string' || !value.trim() || value.length > limit) {
      throw createGeminiError('INVALID_MODEL_RESPONSE')
    }

    validatedReflection[field] = value.trim()
  }

  return validatedReflection
}

async function generateStructuredReflection({ systemInstruction, input }) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw createGeminiError('MODEL_UNAVAILABLE')
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const apiUrl = `${GEMINI_API_BASE_URL}/${encodeURIComponent(model)}:generateContent`
  const requestBody = JSON.stringify({
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: input }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  })
  const providerResponse = await requestGemini(apiUrl, apiKey, requestBody)

  if (providerResponse.status === 429) {
    throw createGeminiError('RATE_LIMITED', providerResponse.status)
  }

  if (!providerResponse.ok) {
    throw createGeminiError('MODEL_UNAVAILABLE', providerResponse.status)
  }

  let payload

  try {
    payload = await providerResponse.json()
  } catch {
    throw createGeminiError('INVALID_MODEL_RESPONSE')
  }

  return validateReflection(extractOutputText(payload))
}

export function generateReflection(memory) {
  return generateStructuredReflection({
    systemInstruction: REFLECTION_SYSTEM_INSTRUCTION,
    input: createReflectionInput(memory),
  })
}

export async function generateContinuedReflection({
  memoryFragments,
  skippedQuestions = [],
}) {
  const reflection = await generateStructuredReflection({
    systemInstruction: CONTINUED_REFLECTION_SYSTEM_INSTRUCTION,
    input: createContinuedReflectionInput({
      memoryFragments,
      skippedQuestions,
    }),
  })

  return {
    type: 'reflection',
    ...reflection,
  }
}
