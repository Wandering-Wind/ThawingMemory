import {
  generateContinuedReflection as generateGeminiContinuedReflection,
  generateReflection as generateGeminiReflection,
  generateWorkingRecipe as generateGeminiWorkingRecipe,
} from './geminiClient.js'
import {
  generateGroqContinuedReflection,
  generateGroqReflection,
  generateGroqWorkingRecipe,
  isGroqConfigured,
} from './groqClient.js'

const FALLBACK_ERROR_CODES = new Set(['RATE_LIMITED', 'MODEL_UNAVAILABLE'])

export async function runWithFallback(primary, fallback, fallbackConfigured = true) {
  try {
    return await primary()
  } catch (primaryError) {
    if (!FALLBACK_ERROR_CODES.has(primaryError.code) || !fallbackConfigured) {
      throw primaryError
    }

    return fallback()
  }
}

export function generateReflection(memory) {
  return runWithFallback(
    () => generateGeminiReflection(memory),
    () => generateGroqReflection(memory),
    isGroqConfigured(),
  )
}

export function generateContinuedReflection(options) {
  return runWithFallback(
    () => generateGeminiContinuedReflection(options),
    () => generateGroqContinuedReflection(options),
    isGroqConfigured(),
  )
}

export function generateWorkingRecipe(options) {
  return runWithFallback(
    () => generateGeminiWorkingRecipe(options),
    () => generateGroqWorkingRecipe(options),
    isGroqConfigured(),
  )
}
