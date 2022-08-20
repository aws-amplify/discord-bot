import type { RequestHandler } from '@sveltejs/kit'

const svg = (color: string) => `
  <svg 
    fill="${color}"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50%" cy="50%" r="40%" />
  </svg>
`

export const GET: RequestHandler = ({ params }) => {
  const { code } = params
  const parsed = code.replace(/\.svg$/, '')
  const hex = parseFloat(parsed).toString(16)
  const color = `#${hex}`
  return {
    headers: {
      // store for 365 days
      'cache-control': import.meta.env.PROD
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
      // store for 30 days
      // 'cache-control': 'public, max-age=2592000, immutable',
      'content-type': 'image/svg+xml',
    },
    body: svg(color),
  }
}