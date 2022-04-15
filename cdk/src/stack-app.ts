import * as path from 'node:path'
import { StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { HeyAmplifyStack } from '@hey-amplify/cdk-construct'

const root = new URL('../../apps/app', import.meta.url).pathname

export class AppStack extends HeyAmplifyStack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
  }
}
