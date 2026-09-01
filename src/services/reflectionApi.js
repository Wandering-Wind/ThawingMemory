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
