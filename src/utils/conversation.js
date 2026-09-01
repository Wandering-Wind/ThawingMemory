export const MAX_FOLLOW_UP_ANSWERS = 3

function requireNonEmptyText(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`${fieldName} must contain text.`)
  }

  return value.trim()
}

function copyAIResponse(response) {
  return {
    reflection: requireNonEmptyText(response?.reflection, 'reflection'),
    limitation: requireNonEmptyText(response?.limitation, 'limitation'),
    question: requireNonEmptyText(response?.question, 'question'),
  }
}

export function createConversation(initialMemory) {
  return {
    memoryFragments: [
      {
        text: requireNonEmptyText(initialMemory, 'initialMemory'),
        questionAnswered: '',
      },
    ],
    aiResponses: [],
    skippedQuestions: [],
    workingRecipe: null,
  }
}

export function getFollowUpAnswerCount(conversation) {
  return Math.max(0, conversation.memoryFragments.length - 1)
}

export function canAnswerFollowUp(conversation) {
  return getFollowUpAnswerCount(conversation) < MAX_FOLLOW_UP_ANSWERS
}

export function addAIResponse(conversation, response) {
  return {
    ...conversation,
    aiResponses: [...conversation.aiResponses, copyAIResponse(response)],
  }
}

export function addMemoryFragment(conversation, { text, questionAnswered }) {
  if (!canAnswerFollowUp(conversation)) {
    throw new RangeError('The conversation follow-up limit has been reached.')
  }

  return {
    ...conversation,
    memoryFragments: [
      ...conversation.memoryFragments,
      {
        text: requireNonEmptyText(text, 'memory fragment'),
        questionAnswered: requireNonEmptyText(
          questionAnswered,
          'questionAnswered',
        ),
      },
    ],
  }
}

export function skipQuestion(conversation, question) {
  return {
    ...conversation,
    skippedQuestions: [
      ...conversation.skippedQuestions,
      requireNonEmptyText(question, 'question'),
    ],
  }
}

export function createConversationRequest({
  action,
  cardId,
  conversation,
}) {
  if (action !== 'continue' && action !== 'build') {
    throw new TypeError('action must be continue or build.')
  }

  return {
    cardId: requireNonEmptyText(cardId, 'cardId'),
    memoryFragments: conversation.memoryFragments.map((fragment) => ({
      text: fragment.text,
      questionAnswered: fragment.questionAnswered,
    })),
    skippedQuestions: [...conversation.skippedQuestions],
    action,
  }
}

export function addWorkingRecipe(conversation, recipe) {
  return {
    ...conversation,
    workingRecipe: {
      dishName: requireNonEmptyText(recipe?.dishName, 'dishName'),
      rememberedIngredients: [...(recipe?.rememberedIngredients ?? [])],
      rememberedMethod: [...(recipe?.rememberedMethod ?? [])],
      sensoryCues: [...(recipe?.sensoryCues ?? [])],
      familyNotes: [...(recipe?.familyNotes ?? [])],
      stillUnknown: [...(recipe?.stillUnknown ?? [])],
    },
  }
}
