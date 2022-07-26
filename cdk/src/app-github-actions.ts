import 'source-map-support/register.js'
import * as cdk from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

const app = new cdk.App({
  context: {
    name: 'github-actions',
  },
})

type RepoIsh = `${string}/${string}`

type GitHubActionsStackProps = cdk.StackProps & {
  repo: RepoIsh
}

/**
 * Stack created to bootstrap deployment AWS Account with the necessary resources for deploying from GitHub Actions
 *
 * Resources:
 * - https://dev.to/simonireilly/secure-aws-cdk-deployments-with-github-actions-3jfk
 * - https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services
 */
export class GitHubActionsStack extends cdk.Stack {
  private readonly appName: string = this.node.tryGetContext('name')

  constructor(scope: Construct, id: string, props: GitHubActionsStackProps) {
    super(scope, id, props)

    const { repo } = props

    cdk.Tags.of(this).add('app:name', this.appName)

    /**
     * Create an Identity provider for GitHub inside your AWS Account. This
     * allows GitHub to present itself to AWS IAM and assume a role.
     */
    const provider = new iam.OpenIdConnectProvider(
      this,
      'GitHubActionsOidcProvider',
      {
        url: 'https://token.actions.githubusercontent.com',
        clientIds: ['sts.amazonaws.com'],
      }
    )

    /**
     * Create a principal for the OpenID; which can allow it to assume
     * deployment roles.
     */
    const GitHubPrincipal = new iam.OpenIdConnectPrincipal(
      provider
    ).withConditions({
      StringLike: {
        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        'token.actions.githubusercontent.com:sub': `repo:${repo}:*`,
      },
    })

    /**
     * Create a deployment role that has short lived credentials. The only
     * principal that can assume this role is the GitHub Open ID provider.
     *
     * This role is granted authority to assume aws cdk roles; which are created
     * by the aws cdk v2.
     */
    const role = new iam.Role(this, 'GitHubActionsRole', {
      assumedBy: GitHubPrincipal,
      description:
        'Role assumed by GitHubPrincipal for deploying from CI using AWS CDK',
      roleName: 'github-actions-role',
      maxSessionDuration: cdk.Duration.hours(1),
      inlinePolicies: {
        CdkDeploymentPolicy: new iam.PolicyDocument({
          assignSids: true,
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['sts:AssumeRole'],
              resources: [`arn:aws:iam::${this.account}:role/cdk-*`],
            }),
          ],
        }),
      },
    })

    /**
     * Set role ARN as an output to capture and set in GitHub as a secret
     */
    new cdk.CfnOutput(this, 'GitHubActionsRoleOutput', {
      value: role.roleArn,
    })
  }
}

new GitHubActionsStack(app, 'GitHubActions', {
  repo: 'aws-amplify/discord-bot',
})
