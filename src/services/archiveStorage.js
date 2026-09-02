export const ARCHIVE_STORAGE_KEY = 'thawingMemory.archive.v2'
export const LEGACY_ARCHIVE_STORAGE_KEY = 'thawingMemory.archive.v1'

function createEntryId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createArchiveEntry({ card, conversation, evaluation }) {
  const latestResponse = conversation.aiResponses.at(-1)

  return {
    id: createEntryId(),
    cardId: card.id,
    cardTitle: card.title,
    domain: 'kitchen',
    prompt: card.prompt,
    memoryFragments: conversation.memoryFragments.map((fragment) => ({
      text: fragment.text,
      questionAnswered: fragment.questionAnswered,
    })),
    aiResponses: conversation.aiResponses.map((response) => ({
      reflection: response.reflection,
      limitation: response.limitation,
      question: response.question,
    })),
    skippedQuestions: [...conversation.skippedQuestions],
    workingRecipe: conversation.workingRecipe
      ? {
          dishName: conversation.workingRecipe.dishName,
          rememberedIngredients: [
            ...conversation.workingRecipe.rememberedIngredients,
          ],
          rememberedMethod: [...conversation.workingRecipe.rememberedMethod],
          sensoryCues: [...conversation.workingRecipe.sensoryCues],
          familyNotes: [...conversation.workingRecipe.familyNotes],
          stillUnknown: [...conversation.workingRecipe.stillUnknown],
        }
      : null,
    userMemory: conversation.memoryFragments[0].text,
    aiReflection: latestResponse?.reflection || '',
    aiLimitation: latestResponse?.limitation || '',
    aiQuestion: latestResponse?.question || '',
    decision: evaluation.decision,
    userRevision:
      evaluation.decision === 'edited' ? evaluation.editedReflection : '',
    userCorrection: evaluation.correction,
    createdAt: new Date().toISOString(),
  }
}

export function readArchiveData() {
  let hasUnreadableData = false
  const entries = []

  for (const key of [ARCHIVE_STORAGE_KEY, LEGACY_ARCHIVE_STORAGE_KEY]) {
    try {
      const storedEntries = localStorage.getItem(key)

      if (!storedEntries) continue

      const parsedEntries = JSON.parse(storedEntries)
      if (!Array.isArray(parsedEntries)) {
        hasUnreadableData = true
        continue
      }

      for (const entry of parsedEntries) {
        if (!entries.some((savedEntry) => savedEntry.id === entry?.id)) {
          entries.push(entry)
        }
      }
    } catch {
      hasUnreadableData = true
    }
  }

  return { entries, hasUnreadableData }
}

export function readArchiveEntries() {
  return readArchiveData().entries
}

export function saveArchiveEntry(entry) {
  const entries = readArchiveEntries()

  if (entries.some((savedEntry) => savedEntry.id === entry.id)) {
    return entries
  }

  const updatedEntries = [entry, ...entries]
  localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(updatedEntries))

  return updatedEntries
}
