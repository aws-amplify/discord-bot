import { APIGatewayProxyEvent } from 'aws-lambda'
import * as nacl from 'tweetnacl'
import { getDiscordSecrets } from '../secrets'

export async function verifyEvent(
  event: APIGatewayProxyEvent
): Promise<boolean> {
  const { PUBLIC_KEY } = (await getDiscordSecrets()) as { PUBLIC_KEY: string }
  const signature = event.headers['X-Signature-Ed25519'.toLowerCase()]
  const timestamp = event.headers['X-Signature-Timestamp'.toLowerCase()]
  const body = event.body
  if (!signature || !timestamp || !body) return false
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  )
  return isVerified
}
