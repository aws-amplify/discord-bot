const { bank } = require('/opt/bank')
const { generateResponse, verifyEvent } = require('/opt/discord')
const { loadSecrets } = require('/opt/secrets')

async function handleCommand({ context }) {
  const somethingWentWrongResponse = '🤕 Something went wrong'
  const command = bank.get(context.data.name)
  if (!command) throw new Error(`Invalid slash command: ${context.data.name}`)
  console.log(
    `Handling command "${command?.config?.name}" for user ${context.member.user.id}`
  )

  let commandResponse
  try {
    commandResponse = await command.handler(context)
  } catch (error) {
    console.error(`Error executing command "${command?.config?.name}"`, error)
  }

  let toRespond = commandResponse ?? somethingWentWrongResponse
  if (typeof toRespond === 'string') {
    toRespond = generateResponse(toRespond)
  }

  return toRespond
}

let secretsLoaded = false
exports.interact = async function interact(event) {
  console.log('EVENT:', JSON.stringify(event))
  if (!secretsLoaded && (await loadSecrets())) secretsLoaded = true
  if (event?.body) {
    const { type, ...context } = event.body
    const verified = await verifyEvent(event)
    switch (type) {
      case 1: {
        if (!verified) break
        return {
          type: 1,
        }
      }
      case 2: {
        if (verified) {
          return {
            type: 4,
            data: await handleCommand({ context }),
          }
        }
        break
      }
    }
  }
  throw new Error('[UNAUTHORIZED] Invalid request')
}
