import type { RequestHandler } from '@sveltejs/kit'

const svg = (color: string) => `
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    fill="${color}"
    viewBox="0 0 100 100"
  >
    <circle cx="50%" cy="50%" r="40%" />
  </svg>
`

export const GET: RequestHandler = ({ params }) => {
  const { code } = params
  if (!code || !code.endsWith('.svg')) {
    return new Response('Invalid request', { status: 400 })
  }
  const hex = code.replace(/\.svg$/, '')
  const color = `#${hex}`
  if (!/^#[0-9a-f]{3,6}$/i.test(color)) {
    return new Response('Invalid color', { status: 400 })
  }
  return new Response(svg(color), {
    headers: {
      // store for 365 days
      'cache-control': import.meta.env.PROD
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
      // store for 30 days
      // 'cache-control': 'public, max-age=2592000, immutable',
      'content-type': 'image/svg+xml',
    },
  })
}
