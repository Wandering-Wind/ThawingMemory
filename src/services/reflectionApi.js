const REFLECTION_ENDPOINT = '/api/reflect'

function isReflectionResponse(value) {
  return (
    value &&
    typeof value.reflection === 'string' &&
    typeof value.limitation === 'string' &&
    typeof value.question === 'string'
  )
}

export async function requestReflection({ cardId, memory }) {
  let response

  try {
    response = await fetch(REFLECTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cardId, memory }),
    })
  } catch {
    throw new Error(
      'The reflection service could not be reached. Your memory is still here.',
    )
  }

  let body

  try {
    body = await response.json()
  } catch {
    throw new Error(
      'The reflection service returned an unreadable response. Please try again.',
    )
  }

  if (!response.ok) {
    throw new Error(
      body?.error?.message ||
        'The reflection could not be generated. Please try again.',
    )
  }

  if (!isReflectionResponse(body)) {
    throw new Error(
      'The AI response was incomplete and has not been displayed. Please try again.',
    )
  }

  return body
}

export async function requestContinuedReflection(request) {
  let response

  try {
    response = await fetch(REFLECTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
  } catch {
    throw new Error(
      'The reflection service could not be reached. Your memory fragments are still here.',
    )
  }

  let body

  try {
    body = await response.json()
  } catch {
    throw new Error(
      'The reflection service returned an unreadable response. Your fragments are still here.',
    )
  }

  if (!response.ok) {
    throw new Error(
      body?.error?.message ||
        'The continued reflection could not be generated. Your fragments are still here.',
    )
  }

  if (body.type !== 'reflection' || !isReflectionResponse(body)) {
    throw new Error(
      'The continued AI response was incomplete and has not been displayed. Your fragments are still here.',
    )
  }

  return body
}

export async function requestWorkingRecipe(request) {
  let response

  try {
    response = await fetch(REFLECTION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
  } catch {
    throw new Error(
      'The recipe service could not be reached. Your memory fragments are still here.',
    )
  }

  let body

  try {
    body = await response.json()
  } catch {
    throw new Error(
      'The recipe service returned an unreadable response. Your fragments are still here.',
    )
  }

  if (!response.ok) {
    throw new Error(
      body?.error?.message ||
        'The working recipe could not be built. Your fragments are still here.',
    )
  }

  const recipe = body?.recipe
  const listFields = [
    'rememberedIngredients',
    'rememberedMethod',
    'sensoryCues',
    'familyNotes',
    'stillUnknown',
  ]

  if (
    body.type !== 'working_recipe' ||
    typeof recipe?.dishName !== 'string' ||
    listFields.some((field) => !Array.isArray(recipe?.[field]))
  ) {
    throw new Error(
      'The working recipe was incomplete and has not been displayed. Your fragments are still here.',
    )
  }

  return body
}
