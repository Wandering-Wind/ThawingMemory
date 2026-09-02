import {
  CONTINUED_REFLECTION_SYSTEM_INSTRUCTION,
  createContinuedReflectionInput,
  createReflectionInput,
  createWorkingRecipeInput,
  REFLECTION_SYSTEM_INSTRUCTION,
  WORKING_RECIPE_SYSTEM_INSTRUCTION,
} from './reflectionPrompt.js'
import { validateReflection, validateWorkingRecipe } from './geminiClient.js'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'openai/gpt-oss-20b'
const REQUEST_TIMEOUT_MS = 30000
const RETRY_DELAY_MS = 750
const MAX_REQUEST_ATTEMPTS = 2
const RETRYABLE_STATUSES = new Set([500, 502, 503, 504])

const reflectionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reflection: { type: 'string' },
    limitation: { type: 'string' },
    question: { type: 'string' },
  },
  required: ['reflection', 'limitation', 'question'],
}

const recipeFields = [
  'rememberedIngredients',
  'rememberedMethod',
  'sensoryCues',
  'familyNotes',
  'stillUnknown',
]

const recipeSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    dishName: { type: 'string' },
    ...Object.fromEntries(
      recipeFields.map((field) => [
        field,
        { type: 'array', items: { type: 'string' } },
      ]),
    ),
  },
  required: ['dishName', ...recipeFields],
}

function createGroqError(code, providerStatus) {
  const error = new Error(code)
  error.code = code
  error.provider = 'groq'
  error.providerStatus = providerStatus
  return error
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export function isGroqConfigured() {
  return Boolean(process.env.GROQ_API_KEY)
}

async function requestGroq(requestBody) {
  for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt += 1) {
    let response

    try {
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
    } catch {
      if (attempt < MAX_REQUEST_ATTEMPTS) {
        await wait(RETRY_DELAY_MS)
        continue
      }

      throw createGroqError('MODEL_UNAVAILABLE')
    }

    if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_REQUEST_ATTEMPTS) {
      await wait(RETRY_DELAY_MS)
      continue
    }

    return response
  }

  throw createGroqError('MODEL_UNAVAILABLE')
}

async function generateStructuredOutput({ systemInstruction, input, schema, validate }) {
  if (!isGroqConfigured()) {
    throw createGroqError('MODEL_UNAVAILABLE')
  }

  const requestBody = JSON.stringify({
    model: process.env.GROQ_MODEL || DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: input },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'thawing_memory_response',
        strict: true,
        schema,
      },
    },
  })
  const response = await requestGroq(requestBody)

  if (response.status === 429) {
    throw createGroqError('RATE_LIMITED', response.status)
  }

  if (!response.ok) {
    throw createGroqError('MODEL_UNAVAILABLE', response.status)
  }

  let payload

  try {
    payload = await response.json()
  } catch {
    throw createGroqError('INVALID_MODEL_RESPONSE')
  }

  const output = payload?.choices?.[0]?.message?.content

  if (typeof output !== 'string') {
    throw createGroqError('INVALID_MODEL_RESPONSE')
  }

  return validate(output)
}

export function generateGroqReflection(memory) {
  return generateStructuredOutput({
    systemInstruction: REFLECTION_SYSTEM_INSTRUCTION,
    input: createReflectionInput(memory),
    schema: reflectionSchema,
    validate: validateReflection,
  })
}

export async function generateGroqContinuedReflection({ memoryFragments, skippedQuestions = [] }) {
  const reflection = await generateStructuredOutput({
    systemInstruction: CONTINUED_REFLECTION_SYSTEM_INSTRUCTION,
    input: createContinuedReflectionInput({ memoryFragments, skippedQuestions }),
    schema: reflectionSchema,
    validate: validateReflection,
  })

  return { type: 'reflection', ...reflection }
}

export async function generateGroqWorkingRecipe({ memoryFragments }) {
  const recipe = await generateStructuredOutput({
    systemInstruction: WORKING_RECIPE_SYSTEM_INSTRUCTION,
    input: createWorkingRecipeInput({ memoryFragments }),
    schema: recipeSchema,
    validate: validateWorkingRecipe,
  })

  return { type: 'working_recipe', recipe }
}
