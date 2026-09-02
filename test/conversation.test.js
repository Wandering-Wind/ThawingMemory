import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addAIResponse,
  addMemoryFragment,
  addWorkingRecipe,
  canAnswerFollowUp,
  createConversation,
  createConversationRequest,
  getFollowUpAnswerCount,
  MAX_FOLLOW_UP_ANSWERS,
  skipQuestion,
} from '../src/utils/conversation.js'

const reflection = {
  reflection: 'The lowered heat appears to be part of the remembered method.',
  limitation: 'The quantities are not known from this fragment.',
  question: 'What changed when the yogurt was added?',
}

test('creates a conversation with user evidence kept separate', () => {
  const conversation = createConversation(' My mother made curry with yogurt. ')

  assert.deepEqual(conversation.memoryFragments, [
    {
      text: 'My mother made curry with yogurt.',
      questionAnswered: '',
    },
  ])
  assert.deepEqual(conversation.aiResponses, [])
  assert.equal(conversation.workingRecipe, null)
})

test('adds an AI response without changing the original conversation', () => {
  const conversation = createConversation('My mother made curry with yogurt.')
  const updatedConversation = addAIResponse(conversation, reflection)

  assert.equal(conversation.aiResponses.length, 0)
  assert.deepEqual(updatedConversation.aiResponses, [reflection])
  assert.equal(updatedConversation.memoryFragments.length, 1)
})

test('allows no more than three follow-up answers', () => {
  let conversation = createConversation('My mother made curry with yogurt.')

  for (let index = 1; index <= MAX_FOLLOW_UP_ANSWERS; index += 1) {
    conversation = addMemoryFragment(conversation, {
      text: `Remembered fragment ${index}`,
      questionAnswered: `Question ${index}`,
    })
  }

  assert.equal(getFollowUpAnswerCount(conversation), 3)
  assert.equal(canAnswerFollowUp(conversation), false)
  assert.throws(
    () =>
      addMemoryFragment(conversation, {
        text: 'One fragment too many',
        questionAnswered: 'Another question',
      }),
    RangeError,
  )
})

test('records a skipped AI question without inventing a user answer', () => {
  const conversation = createConversation('I remember curry leaves.')
  const updatedConversation = skipQuestion(
    conversation,
    'What sound did they make?',
  )

  assert.equal(updatedConversation.memoryFragments.length, 1)
  assert.deepEqual(updatedConversation.skippedQuestions, [
    'What sound did they make?',
  ])
})

test('builds a request from user fragments and explicit AI context', () => {
  const conversation = addMemoryFragment(
    createConversation('My mother made curry with yogurt.'),
    {
      text: 'She lowered the heat before adding it.',
      questionAnswered: 'What happened before the yogurt was added?',
    },
  )

  const request = createConversationRequest({
    action: 'continue',
    cardId: 'kitchen-instinctive-measures',
    conversation,
  })

  assert.equal(request.action, 'continue')
  assert.equal(request.memoryFragments.length, 2)
  assert.equal(request.memoryFragments[1].text, 'She lowered the heat before adding it.')
  assert.equal(
    request.memoryFragments[1].questionAnswered,
    'What happened before the yogurt was added?',
  )
})

test('adds a working recipe without replacing user fragments', () => {
  const conversation = createConversation('My mother made curry with yogurt.')
  const updatedConversation = addWorkingRecipe(conversation, {
    dishName: 'Chicken curry with yogurt',
    rememberedIngredients: ['Chicken', 'Yogurt'],
    rememberedMethod: [],
    sensoryCues: [],
    familyNotes: [],
    stillUnknown: ['Exact quantities'],
  })

  assert.equal(updatedConversation.memoryFragments.length, 1)
  assert.equal(updatedConversation.workingRecipe.dishName, 'Chicken curry with yogurt')
  assert.deepEqual(updatedConversation.workingRecipe.stillUnknown, [
    'Exact quantities',
  ])
})

test('adding a new fragment invalidates an older working recipe', () => {
  const conversation = addWorkingRecipe(createConversation('Curry'), {
    dishName: 'Curry',
    rememberedIngredients: [],
    rememberedMethod: [],
    sensoryCues: [],
    familyNotes: [],
    stillUnknown: ['Everything else'],
  })
  const updatedConversation = addMemoryFragment(conversation, {
    text: 'It included yogurt.',
    questionAnswered: 'What ingredient do you remember?',
  })

  assert.equal(updatedConversation.workingRecipe, null)
})
