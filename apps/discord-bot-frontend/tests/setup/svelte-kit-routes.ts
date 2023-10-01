import { beforeAll } from 'vitest'
import { installPolyfills } from '@sveltejs/kit/node/polyfills'

beforeAll(() => {
  installPolyfills() // we're in Node, so we need to polyfill `fetch` and `Request` etc
})
