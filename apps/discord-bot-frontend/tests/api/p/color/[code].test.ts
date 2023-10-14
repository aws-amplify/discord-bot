import { test, expect } from '@playwright/test'
import prettier from 'prettier'

test.describe('GET /api/p/color/[code]', () => {
  test('should return 200 if color code is valid', async ({ request }) => {
    const response = await request.get('/api/p/color/f3f.svg')
    expect(response.status()).toBe(200)
  })

  test('should return an SVG if color code is valid', async ({ request }) => {
    const response = await request.get('/api/p/color/f3f.svg')
    expect(response.headers()['content-type']).toBe('image/svg+xml')
    expect(prettier.format(await response.text())).toBe(
      prettier.format(
        '<svg xmlns="http://www.w3.org/2000/svg" fill="#f3f" viewBox="0 0 100 100"><circle cx="50%" cy="50%" r="40%"/></svg>'
      )
    )
  })

  test('should return 400 if ".svg" is not appended to the color code', async ({
    request,
  }) => {
    const response = await request.get('/api/p/color/f3f')
    expect(response.status()).toBe(400)
  })

  test('should return 400 if color code is invalid', async ({ request }) => {
    const response = await request.get('/api/p/color/zzz.svg')
    expect(response.status()).toBe(400)
  })
})
