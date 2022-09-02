import { Construct } from 'constructs'
import * as wafv2 from 'aws-cdk-lib/aws-wafv2'

type WAFProps = {
  name: string
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
    const { name } = props
    super(scope, id, {
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${name}-waf`,
        sampledRequestsEnabled: false,
      },
      scope: 'CLOUDFRONT',
      name,
      rules: [
        // {
        //   name: 'AWS-AWSManagedRulesCommonRuleSet',
        //   priority: 1,
        //   overrideAction: {
        //     none: {},
        //   },
        //   statement: {
        //     managedRuleGroupStatement: {
        //       name: 'AWSManagedRulesCommonRuleSet',
        //       vendorName: 'AWS',
        //     },
        //   },
        //   visibilityConfig: {
        //     cloudWatchMetricsEnabled: true,
        //     metricName: 'common',
        //     sampledRequestsEnabled: true,
        //   },
        // },
        {
          // rate-limit requests to the API
          name: 'RateLimit',
          priority: 2,
          action: {
            block: {},
          },
          statement: {
            rateBasedStatement: {
              limit: 100,
              aggregateKeyType: 'IP',
              scopeDownStatement: {
                byteMatchStatement: {
                  searchString: '/api/',
                  fieldToMatch: {
                    singleHeader: {
                      name: ':path',
                    },
                  },
                  textTransformations: [
                    {
                      priority: 0,
                      type: 'URL_DECODE',
                    },
                  ],
                  positionalConstraint: 'STARTS_WITH',
                },
              },
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'rate-limit',
            sampledRequestsEnabled: true,
          },
        },
      ],
    })
  }
}
