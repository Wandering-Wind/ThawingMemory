import {
  createReflectionInput,
  REFLECTION_SYSTEM_INSTRUCTION,
} from './reflectionPrompt.js'

const GEMINI_API_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-3-flash-preview'
const REQUEST_TIMEOUT_MS = 30000

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

export async function generateReflection(memory) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw createGeminiError('MODEL_UNAVAILABLE')
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const apiUrl = `${GEMINI_API_BASE_URL}/${encodeURIComponent(model)}:generateContent`
  let providerResponse

  try {
    providerResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: REFLECTION_SYSTEM_INSTRUCTION }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: createReflectionInput(memory) }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw createGeminiError('MODEL_UNAVAILABLE')
  }

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
