import { createServer } from 'node:http'
import { generateReflection } from './geminiClient.js'
import { validateLegacyReflectionRequest } from './reflectionRequest.js'

const DEFAULT_PORT = 3001
const MAX_REQUEST_SIZE = 12000
const configuredPort = Number.parseInt(process.env.AI_SERVER_PORT, 10)
const port = Number.isInteger(configuredPort) ? configuredPort : DEFAULT_PORT

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(body))
}

function sendError(response, statusCode, code, message) {
  sendJson(response, statusCode, {
    error: {
      code,
      message,
    },
  })
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    let receivedBytes = 0

    request.setEncoding('utf8')

    request.on('data', (chunk) => {
      receivedBytes += Buffer.byteLength(chunk)

      if (receivedBytes > MAX_REQUEST_SIZE) {
        const error = new Error('Request body is too large.')
        error.code = 'PAYLOAD_TOO_LARGE'
        reject(error)
        request.resume()
        return
      }

      body += chunk
    })

    request.on('end', () => {
      if (receivedBytes > MAX_REQUEST_SIZE) {
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        const error = new Error('Request body is not valid JSON.')
        error.code = 'INVALID_JSON'
        reject(error)
      }
    })

    request.on('error', reject)
  })
}

async function handleReflectionRequest(request, response) {
  try {
    const body = await readJsonBody(request)
    const validationError = validateLegacyReflectionRequest(body)

    if (validationError) {
      sendError(response, 400, validationError.code, validationError.message)
      return
    }

    const reflection = await generateReflection(body.memory)
    sendJson(response, 200, reflection)
  } catch (error) {
    if (error.code === 'PAYLOAD_TOO_LARGE') {
      sendError(
        response,
        413,
        'PAYLOAD_TOO_LARGE',
        'The request is too large for the prototype.',
      )
      return
    }

    if (error.code === 'INVALID_JSON') {
      sendError(
        response,
        400,
        'INVALID_JSON',
        'Send a valid JSON object containing cardId and memory.',
      )
      return
    }

    if (error.code === 'RATE_LIMITED') {
      sendError(
        response,
        429,
        'RATE_LIMITED',
        'The free AI service is temporarily at its limit. Your memory is still here. Please try again shortly.',
      )
      return
    }

    if (error.code === 'MODEL_UNAVAILABLE') {
      if (Number.isInteger(error.providerStatus)) {
        console.error(
          `Gemini request failed with provider status ${error.providerStatus}.`,
        )
      }

      sendError(
        response,
        503,
        'MODEL_UNAVAILABLE',
        'The AI service is unavailable right now. Your memory has not been lost.',
      )
      return
    }

    if (error.code === 'INVALID_MODEL_RESPONSE') {
      sendError(
        response,
        502,
        'INVALID_MODEL_RESPONSE',
        'The AI response could not be displayed safely. Your memory is still here, and you can try again.',
      )
      return
    }

    console.error('Reflection request failed with a sanitised unknown error.')
    sendError(
      response,
      500,
      'UNKNOWN_ERROR',
      'Something interrupted the reflection request. Please try again.',
    )
  }
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, { status: 'ok' })
    return
  }

  if (request.url === '/api/reflect') {
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST')
      sendError(
        response,
        405,
        'METHOD_NOT_ALLOWED',
        'Use POST to request a reflection.',
      )
      return
    }

    await handleReflectionRequest(request, response)
    return
  }

  sendError(
    response,
    404,
    'NOT_FOUND',
    'The requested server route does not exist.',
  )
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Thawing Memory server running at http://127.0.0.1:${port}`)
})
