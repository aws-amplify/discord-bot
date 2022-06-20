import {
  SSMClient,
  GetParametersByPathCommand,
  GetParameterCommand,
  PutParameterCommand,
} from '@aws-sdk/client-ssm'
import type { PutParameterCommandInput } from '@aws-sdk/client-ssm'

const REGION = process.env.REGION || 'us-east-1'
const PROJECT_NAME = 'hey-amplify'
const PROJECT_ENV = 'local'
// TODO: interpolate environment name in place of 'env'
const PREFIX = `/app/${PROJECT_NAME}/${PROJECT_ENV}/secret/`

type SecretStoreProps = {
  //
}

// export class SecretStore {
//   constructor(props: SecretStoreProps) {}
// }
