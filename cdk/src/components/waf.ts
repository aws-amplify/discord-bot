import { Construct } from 'constructs'
import * as wafv2 from 'aws-cdk-lib/aws-wafv2'

type WAFProps = {
  name: string
  /**
   * @default "CLOUDFRONT"
   */
  scope?: wafv2.CfnWebACLProps['scope']
}

/**
 * Creates a Web Application Firewall (WAF) and associates the given ARNs.
 *
 * https://blogs.halodoc.io/apply-rate-limiting-to-your-resources-using-aws-cloud-front-and-waf/
 * https://gist.github.com/statik/f1ac9d6227d98d30c7a7cec0c83f4e64
 * https://instil.co/blog/aws-appsync-waf-cdk-v2
 */
export class WAF extends wafv2.CfnWebACL {
  constructor(scope: Construct, id: string, props: WAFProps) {
    const { name, scope: wafScope } = props
    super(scope, id, {
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${name}-waf`,
        sampledRequestsEnabled: false,
      },
      scope: wafScope || 'CLOUDFRONT',
      name,
      rules: [
        {
          name: 'Common',
          priority: 0,
          statement: {
            managedRuleGroupStatement: {
              name: 'AWSManagedRulesCommonRuleSet',
              vendorName: 'AWS',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'MetricForWaf-Common',
            sampledRequestsEnabled: true,
          },
          overrideAction: {
            none: {},
          },
        },
        {
          // rate-limit requests
          name: 'RateLimit',
          priority: 2,
          action: {
            block: {},
          },
          statement: {
            rateBasedStatement: {
              limit: 500, // per 5 minutes
              aggregateKeyType: 'IP',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'MetricForWaf-RateLimit',
            sampledRequestsEnabled: true,
          },
        },
        {
          // rate-limit requests
          name: 'RateLimitApi',
          priority: 1,
          action: {
            block: {},
          },
          statement: {
            rateBasedStatement: {
              limit: 500, // per 5 minutes
              aggregateKeyType: 'IP',
              scopeDownStatement: {
                byteMatchStatement: {
                  searchString: '/api/',
                  fieldToMatch: {
                    uriPath: {},
                  },
                  positionalConstraint: 'STARTS_WITH',
                  textTransformations: [
                    {
                      priority: 0,
                      type: 'NONE',
                    },
                  ],
                },
              },
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'MetricForWaf-RateLimitApi',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'DenyRequestsToWpAdmin',
          priority: 3,
          action: {
            block: {},
          },
          statement: {
            byteMatchStatement: {
              // if requested path is wp-admin
              searchString: '/wp-admin',
              fieldToMatch: {
                uriPath: {},
              },
              positionalConstraint: 'STARTS_WITH',
              textTransformations: [
                {
                  priority: 0,
                  type: 'NONE',
                },
              ],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'MetricForWaf-DenyRequestsToWpAdmin',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'DenyRequestsToWpContent',
          priority: 4,
          action: {
            block: {},
          },
          statement: {
            byteMatchStatement: {
              // if requested path is wp-content
              searchString: '/wp-content',
              fieldToMatch: {
                uriPath: {},
              },
              positionalConstraint: 'STARTS_WITH',
              textTransformations: [
                {
                  priority: 0,
                  type: 'NONE',
                },
              ],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'MetricForWaf-DenyRequestsToWpContent',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'DenyRequestsForSwagger',
          priority: 5,
          action: {
            block: {},
          },
          statement: {
            byteMatchStatement: {
              // if requested path is swagger
              searchString: '/swagger',
              fieldToMatch: {
                uriPath: {},
              },
              positionalConstraint: 'STARTS_WITH',
              textTransformations: [
                {
                  priority: 0,
                  type: 'NONE',
                },
              ],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'MetricForWaf-DenyRequestsForSwagger',
            sampledRequestsEnabled: true,
          },
        },
      ],
    })

    this.ignoreFileExtension('.sql')
    this.ignoreFileExtension('.zip')
    this.ignoreFileExtension('.rar')
    this.ignoreFileExtension('.axd')
    this.ignoreFileExtension('.txt')
    this.ignoreFileExtension('.md')
    this.ignoreFileExtension('.yml')
    this.ignoreFileExtension('.gz')
    this.ignoreFileExtension('.tar')
  }

  private get nextPriority() {
    const rules = this.rules as wafv2.CfnWebACL.RuleProperty[]
    return rules.reduce((acc, curr) => {
      if (acc > curr.priority) return acc
      else return curr.priority + 1
    }, 0)
  }

  public addAssociation(logicalId: string, resourceArn: string) {
    return new wafv2.CfnWebACLAssociation(this, logicalId, {
      resourceArn,
      webAclArn: this.attrArn,
    })
  }

  public ignoreFileExtension(extension: `.${string}`) {
    const display = extension.replace(/^\./, '')
    const rules = this.rules as wafv2.CfnWebACL.RuleProperty[]

    rules.push({
      name: `DenyRequestsFor${display}Files`,
      priority: this.nextPriority,
      action: {
        block: {},
      },
      statement: {
        byteMatchStatement: {
          // if request ends in .zip
          searchString: extension,
          fieldToMatch: {
            uriPath: {},
          },
          positionalConstraint: 'ENDS_WITH',
          textTransformations: [
            {
              priority: 0,
              type: 'NONE',
            },
          ],
        },
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `MetricForWaf-DenyRequestsFor${display}Files`,
        sampledRequestsEnabled: true,
      },
    })
  }
}
