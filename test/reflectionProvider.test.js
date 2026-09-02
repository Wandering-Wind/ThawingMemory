import assert from 'node:assert/strict'
import test from 'node:test'
import { runWithFallback } from '../server/reflectionProvider.js'

function providerError(code) {
  return Object.assign(new Error(code), { code })
}

test('uses the primary provider when it succeeds', async () => {
  let fallbackCalled = false
  const result = await runWithFallback(
    async () => 'gemini result',
    async () => {
      fallbackCalled = true
      return 'groq result'
    },
  )

  assert.equal(result, 'gemini result')
  assert.equal(fallbackCalled, false)
})

test('uses the fallback after a temporary primary failure', async () => {
  const result = await runWithFallback(
    async () => {
      throw providerError('RATE_LIMITED')
    },
    async () => 'groq result',
  )

  assert.equal(result, 'groq result')
})

test('does not hide an invalid structured response with fallback', async () => {
  let fallbackCalled = false

  await assert.rejects(
    runWithFallback(
      async () => {
        throw providerError('INVALID_MODEL_RESPONSE')
      },
      async () => {
        fallbackCalled = true
      },
    ),
    { code: 'INVALID_MODEL_RESPONSE' },
  )

  assert.equal(fallbackCalled, false)
})

test('preserves the primary error when no fallback key is configured', async () => {
  await assert.rejects(
    runWithFallback(
      async () => {
        throw providerError('MODEL_UNAVAILABLE')
      },
      async () => 'groq result',
      false,
    ),
    { code: 'MODEL_UNAVAILABLE' },
  )
})
