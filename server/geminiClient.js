import {
  CONTINUED_REFLECTION_SYSTEM_INSTRUCTION,
  createContinuedReflectionInput,
  createReflectionInput,
  createWorkingRecipeInput,
  REFLECTION_SYSTEM_INSTRUCTION,
  WORKING_RECIPE_SYSTEM_INSTRUCTION,
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
    observation: {
      type: 'STRING',
      description:
        'One concise, tentative observation about a detail supplied in a user-authored memory fragment.',
    },
    evidence: {
      type: 'ARRAY',
      description:
        'One or more exact excerpts from user-authored memory fragments that support the observation.',
      items: {
        type: 'OBJECT',
        properties: {
          fragmentNumber: {
            type: 'INTEGER',
            description: 'The one-based sequence number of the user fragment.',
          },
          quote: {
            type: 'STRING',
            description: 'An exact, continuous excerpt copied from that fragment.',
          },
        },
        required: ['fragmentNumber', 'quote'],
      },
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
  required: ['observation', 'evidence', 'limitation', 'question'],
}

const fieldLimits = {
  observation: 700,
  limitation: 500,
  question: 300,
}

const recipeFields = [
  'rememberedIngredients',
  'rememberedMethod',
  'sensoryCues',
  'familyNotes',
  'stillUnknown',
]

const recipeSchema = {
  type: 'OBJECT',
  properties: {
    dishName: { type: 'STRING' },
    rememberedIngredients: { type: 'ARRAY', items: { type: 'STRING' } },
    rememberedMethod: { type: 'ARRAY', items: { type: 'STRING' } },
    sensoryCues: { type: 'ARRAY', items: { type: 'STRING' } },
    familyNotes: { type: 'ARRAY', items: { type: 'STRING' } },
    stillUnknown: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['dishName', ...recipeFields],
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

export function validateReflection(responseText, memoryFragments = []) {
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

  const evidence = reflection.evidence

  if (
    !Array.isArray(evidence) ||
    evidence.length < 1 ||
    evidence.length > 4 ||
    evidence.some(
      (item) =>
        !item ||
        typeof item !== 'object' ||
        Array.isArray(item) ||
        !Number.isInteger(item.fragmentNumber) ||
        item.fragmentNumber < 1 ||
        typeof item.quote !== 'string' ||
        !item.quote.trim() ||
        item.quote.length > 300,
    )
  ) {
    throw createGeminiError('INVALID_MODEL_RESPONSE')
  }

  if (
    !Array.isArray(memoryFragments) ||
    evidence.some((item) => {
      const fragment = memoryFragments[item.fragmentNumber - 1]

      return (
        !fragment ||
        typeof fragment.text !== 'string' ||
        !fragment.text.includes(item.quote.trim())
      )
    })
  ) {
    throw createGeminiError('INVALID_MODEL_RESPONSE')
  }

  return {
    reflection: validatedReflection.observation,
    evidence: evidence.map((item) => ({
      fragmentNumber: item.fragmentNumber,
      quote: item.quote.trim(),
    })),
    limitation: validatedReflection.limitation,
    question: validatedReflection.question,
  }
}

export function validateWorkingRecipe(responseText) {
  let recipe

  try {
    recipe = JSON.parse(responseText)
  } catch {
    throw createGeminiError('INVALID_MODEL_RESPONSE')
  }

  if (
    !recipe ||
    typeof recipe !== 'object' ||
    Array.isArray(recipe) ||
    typeof recipe.dishName !== 'string' ||
    !recipe.dishName.trim() ||
    recipe.dishName.length > 160
  ) {
    throw createGeminiError('INVALID_MODEL_RESPONSE')
  }

  const validatedRecipe = { dishName: recipe.dishName.trim() }

  for (const field of recipeFields) {
    const items = recipe[field]

    if (
      !Array.isArray(items) ||
      items.length > 12 ||
      items.some(
        (item) =>
          typeof item !== 'string' || !item.trim() || item.length > 400,
      )
    ) {
      throw createGeminiError('INVALID_MODEL_RESPONSE')
    }

    validatedRecipe[field] = items.map((item) => item.trim())
  }

  return validatedRecipe
}

async function generateStructuredOutput({
  systemInstruction,
  input,
  schema,
  validate,
  validationContext,
}) {
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
      responseSchema: schema,
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

  return validate(extractOutputText(payload), validationContext)
}

export function generateReflection(memory) {
  return generateStructuredOutput({
    systemInstruction: REFLECTION_SYSTEM_INSTRUCTION,
    input: createReflectionInput(memory),
    schema: responseSchema,
    validate: validateReflection,
    validationContext: [{ text: memory }],
  })
}

export async function generateContinuedReflection({
  memoryFragments,
  skippedQuestions = [],
}) {
  const reflection = await generateStructuredOutput({
    systemInstruction: CONTINUED_REFLECTION_SYSTEM_INSTRUCTION,
    input: createContinuedReflectionInput({
      memoryFragments,
      skippedQuestions,
    }),
    schema: responseSchema,
    validate: validateReflection,
    validationContext: memoryFragments,
  })

  return {
    type: 'reflection',
    ...reflection,
  }
}

export async function generateWorkingRecipe({ memoryFragments }) {
  const recipe = await generateStructuredOutput({
    systemInstruction: WORKING_RECIPE_SYSTEM_INSTRUCTION,
    input: createWorkingRecipeInput({ memoryFragments }),
    schema: recipeSchema,
    validate: validateWorkingRecipe,
  })

  return { type: 'working_recipe', recipe }
}
