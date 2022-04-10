import { commands } from '@hey-amplify/discord'
import { describe, expect, it } from 'vitest'

const github = commands.get('github')

describe('/github', () => {
  it('github', () => {
    expect(true).toBe(true)
  })
})
