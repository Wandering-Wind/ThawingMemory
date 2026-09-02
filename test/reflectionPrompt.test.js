import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CONTINUED_REFLECTION_SYSTEM_INSTRUCTION,
  createContinuedReflectionInput,
  createWorkingRecipeInput,
  WORKING_RECIPE_SYSTEM_INSTRUCTION,
} from '../server/reflectionPrompt.js'

test('labels user fragments separately from AI question context', () => {
  const input = createContinuedReflectionInput({
    memoryFragments: [
      {
        text: 'My mother made chicken curry with yogurt.',
        questionAnswered: '',
      },
      {
        text: 'She lowered the heat first.',
        questionAnswered: 'What happened before the yogurt was added?',
      },
    ],
    skippedQuestions: ['Do you remember the quantity?'],
  })

  assert.match(input, /"source": "user"/)
  assert.match(input, /"source": "ai_context_only"/)
  assert.match(input, /"text": "She lowered the heat first\."/)
  assert.match(input, /"text": "Do you remember the quantity\?"/)
})

test('working recipe input contains only user-authored evidence', () => {
  const input = createWorkingRecipeInput({
    memoryFragments: [
      { text: 'My mother used yogurt.', questionAnswered: '' },
      {
        text: 'She lowered the heat first.',
        questionAnswered: 'Did she add two cups of coconut milk?',
      },
    ],
  })

  assert.match(input, /My mother used yogurt/)
  assert.match(input, /She lowered the heat first/)
  assert.doesNotMatch(input, /two cups of coconut milk/)
  assert.match(
    WORKING_RECIPE_SYSTEM_INSTRUCTION,
    /Do not invent ingredients, quantities, timings/,
  )
})

test('continuation instruction limits evidence to user-authored fragments', () => {
  assert.match(
    CONTINUED_REFLECTION_SYSTEM_INSTRUCTION,
    /Use only the text fields inside memoryFragments as evidence/,
  )
  assert.match(
    CONTINUED_REFLECTION_SYSTEM_INSTRUCTION,
    /Do not repeat any question recorded/,
  )
  assert.match(
    CONTINUED_REFLECTION_SYSTEM_INSTRUCTION,
    /Do not provide a recipe or fill a gap yourself/,
  )
})
