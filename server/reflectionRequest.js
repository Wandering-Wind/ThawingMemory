export const MAX_MEMORY_LENGTH = 2000
export const MAX_MEMORY_FRAGMENTS = 4
export const MAX_QUESTION_LENGTH = 300
export const MAX_SKIPPED_QUESTIONS = 3

const KNOWN_CARD_IDS = new Set(['kitchen-instinctive-measures'])
const CONVERSATION_ACTIONS = new Set(['continue', 'build'])

function validateRequestObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      code: 'INVALID_JSON',
      message: 'Send a JSON object containing the reflection request.',
    }
  }

  if (!KNOWN_CARD_IDS.has(body.cardId)) {
    return {
      code: 'INVALID_CARD',
      message: 'The requested memory card is not available.',
    }
  }

  return null
}

function validateText(value, maximumLength) {
  return (
    typeof value === 'string' &&
    Boolean(value.trim()) &&
    value.length <= maximumLength
  )
}

export function validateLegacyReflectionRequest(body) {
  const requestError = validateRequestObject(body)

  if (requestError) {
    return requestError
  }

  if (typeof body.memory !== 'string' || !body.memory.trim()) {
    return {
      code: 'INVALID_MEMORY',
      message: 'Add a memory fragment before asking for a reflection.',
    }
  }

  if (body.memory.length > MAX_MEMORY_LENGTH) {
    return {
      code: 'MEMORY_TOO_LONG',
      message:
        'This memory is too long for the prototype. Shorten it to 2,000 characters or fewer.',
    }
  }

  return null
}

export function validateConversationRequest(body) {
  const requestError = validateRequestObject(body)

  if (requestError) {
    return requestError
  }

  if (!CONVERSATION_ACTIONS.has(body.action)) {
    return {
      code: 'INVALID_ACTION',
      message: 'Choose whether to continue or build the working recipe.',
    }
  }

  if (!Array.isArray(body.memoryFragments) || body.memoryFragments.length < 1) {
    return {
      code: 'INVALID_FRAGMENTS',
      message: 'Add at least one memory fragment before continuing.',
    }
  }

  if (body.memoryFragments.length > MAX_MEMORY_FRAGMENTS) {
    return {
      code: 'TOO_MANY_FOLLOW_UPS',
      message: 'The prototype supports up to three follow-up answers.',
    }
  }

  for (const [index, fragment] of body.memoryFragments.entries()) {
    if (!fragment || typeof fragment !== 'object' || Array.isArray(fragment)) {
      return {
        code: 'INVALID_FRAGMENTS',
        message: 'Each memory fragment must contain user-authored text.',
      }
    }

    if (!validateText(fragment.text, MAX_MEMORY_LENGTH)) {
      return {
        code: 'INVALID_FRAGMENTS',
        message:
          'Each memory fragment must contain between 1 and 2,000 characters.',
      }
    }

    const questionAnswered = fragment.questionAnswered
    const hasValidQuestion = validateText(
      questionAnswered,
      MAX_QUESTION_LENGTH,
    )

    if (index === 0 && questionAnswered !== '') {
      return {
        code: 'INVALID_FRAGMENTS',
        message: 'The first memory fragment cannot answer an AI question.',
      }
    }

    if (index > 0 && !hasValidQuestion) {
      return {
        code: 'INVALID_FRAGMENTS',
        message: 'Each follow-up fragment must identify the question it answers.',
      }
    }
  }

  if (body.skippedQuestions !== undefined) {
    if (
      !Array.isArray(body.skippedQuestions) ||
      body.skippedQuestions.length > MAX_SKIPPED_QUESTIONS ||
      body.skippedQuestions.some(
        (question) => !validateText(question, MAX_QUESTION_LENGTH),
      )
    ) {
      return {
        code: 'INVALID_SKIPPED_QUESTIONS',
        message: 'Skipped questions must use the supported conversation format.',
      }
    }
  }

  return null
}
