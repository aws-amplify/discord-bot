import * as crypto from 'node:crypto'

// https://gist.github.com/stigok/57d075c1cf2a609cb758898c0b202428
export function verifyGithubWebhookEvent(token, payloadbody, signature256: string) {
  const sig = Buffer.from(signature256 || '', 'utf8')
  const hmac = crypto.createHmac('sha256', token)
  const digest = Buffer.from(
    'sha256' + '=' + hmac.update(JSON.stringify(payloadbody)).digest('hex'),
    'utf8'
  )
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) return false
  return true
}