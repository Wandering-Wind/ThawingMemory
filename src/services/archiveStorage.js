export const ARCHIVE_STORAGE_KEY = 'thawingMemory.archive.v1'

function createEntryId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createArchiveEntry({ card, evaluation, memory, response }) {
  return {
    id: createEntryId(),
    cardId: card.id,
    cardTitle: card.title,
    domain: 'kitchen',
    prompt: card.prompt,
    userMemory: memory,
    aiReflection: response.reflection,
    aiLimitation: response.limitation,
    aiQuestion: response.question,
    decision: evaluation.decision,
    userRevision:
      evaluation.decision === 'edited' ? evaluation.editedReflection : '',
    userCorrection: evaluation.correction,
    createdAt: new Date().toISOString(),
  }
}

export function readArchiveData() {
  try {
    const storedEntries = localStorage.getItem(ARCHIVE_STORAGE_KEY)

    if (!storedEntries) {
      return { entries: [], hasUnreadableData: false }
    }

    const entries = JSON.parse(storedEntries)

    if (!Array.isArray(entries)) {
      return { entries: [], hasUnreadableData: true }
    }

    return { entries, hasUnreadableData: false }
  } catch {
    return { entries: [], hasUnreadableData: true }
  }
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
