import { createServer } from 'node:http'

const DEFAULT_PORT = 3001
const configuredPort = Number.parseInt(process.env.AI_SERVER_PORT, 10)
const port = Number.isInteger(configuredPort) ? configuredPort : DEFAULT_PORT

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(body))
}

const server = createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, { status: 'ok' })
    return
  }

  sendJson(response, 404, {
    error: {
      code: 'NOT_FOUND',
      message: 'The requested server route does not exist.',
    },
  })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Thawing Memory server running at http://127.0.0.1:${port}`)
})
