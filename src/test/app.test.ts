import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert'
import { App } from '@aws-cdk/core'
import { BotStack } from '../stack'

test('Empty Stack', () => {
  const app = new App()
  // WHEN
  const stack = new BotStack(app, 'MyTestStack')
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  )
})
