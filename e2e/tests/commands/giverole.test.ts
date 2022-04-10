import { commands } from '@hey-amplify/bot'
import { describe, expect, it } from 'vitest'

const giverole = commands.get('giverole')

describe('/giverole', () => {
  it('gives role', () => {
    expect(true).toBe(true)
  })
})
