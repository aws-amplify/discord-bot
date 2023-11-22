import { test, expect } from '@playwright/test'
import { GUILD_COOKIE } from '$lib/constants'
import { env } from '../playwright.config'

test.describe('guild cookie', () => {
  test('sets on page load', async ({ page }) => {
    await page.goto('/')
    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === GUILD_COOKIE)).toBeTruthy()
  })

  test('sets default value on page load', async ({ page }) => {
    await page.goto('/')
    const cookies = await page.context().cookies()
    const cookie = cookies.find((c) => c.name === GUILD_COOKIE)
    expect(cookie?.value).toEqual(env.DISCORD_GUILD_ID)
  })

  test('falls back to default value if invalid', async ({ page }) => {
    // push the invalid cookie before loading the page
    ;(await page.context().cookies()).push({
      name: GUILD_COOKIE,
      value: 'invalid',
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    })
    await page.goto('/')
    // check the cookies after loading the page
    const cookies = await page.context().cookies()
    const cookie = cookies.find((c) => c.name === GUILD_COOKIE)
    expect(cookie?.value).toEqual(env.DISCORD_GUILD_ID)
  })
})
