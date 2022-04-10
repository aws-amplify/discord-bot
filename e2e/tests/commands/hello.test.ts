import { commands } from '@hey-amplify/bot'
import { describe, expect, it } from 'vitest'

const hello = commands.get('hello')

describe('/hello', () => {
  it('says hello', () => {
    expect(true).toBe(true)
  })
})
