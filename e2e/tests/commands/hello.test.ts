import { commands } from '@hey-amplify/discord'
import { describe, expect, it } from 'vitest'

const hello = commands.get('hello')

describe('/hello', () => {
  it('says hello', () => {
    expect(true).toBe(true)
  })
})
