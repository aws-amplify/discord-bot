import { StackProps } from 'aws-cdk-lib'
import type * as ecs from 'aws-cdk-lib/aws-ecs'
import type * as efs from 'aws-cdk-lib/aws-efs'
import type * as ssm from 'aws-cdk-lib/aws-ssm'

export interface HeyAmplifyAppStackProps extends StackProps {
  secrets: Record<string, ssm.IParameter>
  cluster: ecs.Cluster
  filesystem?: efs.FileSystem
  filesystemMountPoint?: string
}
