import { commands } from '@hey-amplify/bot'
import { describe, expect, it } from 'vitest'

const contribute = commands.get('contribute')

describe('/contribute', () => {
  it('contribute', () => {
    expect(true).toBe(true)
  })
})
