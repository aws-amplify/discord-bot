import 'source-map-support/register.js'
import { getSecrets } from '@hey-amplify/support'
import * as cdk from 'aws-cdk-lib'
import { HeyAmplifyStack } from './stack'
import { pkg } from './pkg'

const app = new cdk.App({
  context: {
    name: 'hey-amplify',
    env: 'main',
    version: pkg.version,
  },
})

const name = app.node.tryGetContext('name')
const env = app.node.tryGetContext('env')

// setup secrets are manually created in SSM using the zone name and ID from the manually created Route53 hosted zone
type SetupSecrets = {
  HOSTED_ZONE_NAME: string
  HOSTED_ZONE_ID: string
}

// grab setup secrets from SSM
const setup: SetupSecrets = (await getSecrets(name, '_setup')) as SetupSecrets

new HeyAmplifyStack(app, `${name}-${env}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  // stack relies on `subdomain` being truthy to determine if it should create a subdomain
  subdomain:
    Object.keys(setup).length > 0
      ? {
          hostedZoneName: setup.HOSTED_ZONE_NAME,
          hostedZoneId: setup.HOSTED_ZONE_ID,
        }
      : undefined,
})
