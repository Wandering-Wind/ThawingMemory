import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ARCHIVE_STORAGE_KEY,
  createArchiveEntry,
  LEGACY_ARCHIVE_STORAGE_KEY,
  readArchiveData,
  saveArchiveEntry,
} from '../src/services/archiveStorage.js'
import { addAIResponse, addWorkingRecipe, createConversation } from '../src/utils/conversation.js'

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

function completeConversation() {
  return addWorkingRecipe(
    addAIResponse(createConversation('My mother added coconut by hand.'), {
      reflection: 'The amount was judged by hand.',
      limitation: 'The number of handfuls is unknown.',
      question: 'How many handfuls did she use?',
    }),
    {
      dishName: 'chammanthi',
      rememberedIngredients: ['coconut'],
      rememberedMethod: ['Add coconut by hand'],
      sensoryCues: [],
      familyNotes: [],
      stillUnknown: ['Number of handfuls'],
    },
  )
}

test('creates a version 2 trace containing the conversation and recipe', () => {
  const entry = createArchiveEntry({
    card: { id: 'kitchen-instinctive-measures', title: 'Measured by Memory', prompt: 'Remember.' },
    conversation: completeConversation(),
    evaluation: { decision: 'kept', editedReflection: '', correction: '' },
  })

  assert.equal(entry.memoryFragments.length, 1)
  assert.equal(entry.aiResponses.length, 1)
  assert.equal(entry.workingRecipe.dishName, 'chammanthi')
  assert.deepEqual(entry.workingRecipe.stillUnknown, ['Number of handfuls'])
})

test('reads version 2 and legacy entries without deleting either', () => {
  global.localStorage = createStorage({
    [ARCHIVE_STORAGE_KEY]: JSON.stringify([{ id: 'new-entry' }]),
    [LEGACY_ARCHIVE_STORAGE_KEY]: JSON.stringify([{ id: 'legacy-entry' }]),
  })

  assert.deepEqual(
    readArchiveData().entries.map((entry) => entry.id),
    ['new-entry', 'legacy-entry'],
  )
})

test('saves new traces only to version 2 storage', () => {
  global.localStorage = createStorage()
  saveArchiveEntry({ id: 'new-entry' })

  assert.equal(
    JSON.parse(global.localStorage.getItem(ARCHIVE_STORAGE_KEY))[0].id,
    'new-entry',
  )
  assert.equal(global.localStorage.getItem(LEGACY_ARCHIVE_STORAGE_KEY), null)
})

test('still reads legacy traces when version 2 data is malformed', () => {
  global.localStorage = createStorage({
    [ARCHIVE_STORAGE_KEY]: '{not valid json',
    [LEGACY_ARCHIVE_STORAGE_KEY]: JSON.stringify([{ id: 'legacy-entry' }]),
  })

  const archive = readArchiveData()
  assert.equal(archive.hasUnreadableData, true)
  assert.deepEqual(archive.entries, [{ id: 'legacy-entry' }])
})
