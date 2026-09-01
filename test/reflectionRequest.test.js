import assert from 'node:assert/strict'
import test from 'node:test'
import {
  validateConversationRequest,
  validateLegacyReflectionRequest,
} from '../server/reflectionRequest.js'

const cardId = 'kitchen-instinctive-measures'

function createConversationRequest(overrides = {}) {
  return {
    cardId,
    action: 'continue',
    memoryFragments: [
      {
        text: 'My mother made curry with yogurt.',
        questionAnswered: '',
      },
    ],
    skippedQuestions: [],
    ...overrides,
  }
}

test('keeps the existing one-turn request valid', () => {
  assert.equal(
    validateLegacyReflectionRequest({
      cardId,
      memory: 'My mother made curry with yogurt.',
    }),
    null,
  )
})

test('accepts a valid conversation request', () => {
  const request = createConversationRequest({
    memoryFragments: [
      {
        text: 'My mother made curry with yogurt.',
        questionAnswered: '',
      },
      {
        text: 'She lowered the heat first.',
        questionAnswered: 'What happened before the yogurt was added?',
      },
    ],
  })

  assert.equal(validateConversationRequest(request), null)
})

test('accepts the build action', () => {
  assert.equal(
    validateConversationRequest(createConversationRequest({ action: 'build' })),
    null,
  )
})

test('rejects an unsupported conversation action', () => {
  const error = validateConversationRequest(
    createConversationRequest({ action: 'chat' }),
  )

  assert.equal(error.code, 'INVALID_ACTION')
})

test('rejects more than three follow-up fragments', () => {
  const memoryFragments = [
    { text: 'Initial memory', questionAnswered: '' },
    { text: 'Follow-up one', questionAnswered: 'Question one' },
    { text: 'Follow-up two', questionAnswered: 'Question two' },
    { text: 'Follow-up three', questionAnswered: 'Question three' },
    { text: 'Follow-up four', questionAnswered: 'Question four' },
  ]
  const error = validateConversationRequest(
    createConversationRequest({ memoryFragments }),
  )

  assert.equal(error.code, 'TOO_MANY_FOLLOW_UPS')
})

test('rejects a follow-up without the AI question it answers', () => {
  const memoryFragments = [
    { text: 'Initial memory', questionAnswered: '' },
    { text: 'Follow-up memory', questionAnswered: '' },
  ]
  const error = validateConversationRequest(
    createConversationRequest({ memoryFragments }),
  )

  assert.equal(error.code, 'INVALID_FRAGMENTS')
})

test('rejects malformed skipped questions', () => {
  const error = validateConversationRequest(
    createConversationRequest({ skippedQuestions: [''] }),
  )

  assert.equal(error.code, 'INVALID_SKIPPED_QUESTIONS')
})
