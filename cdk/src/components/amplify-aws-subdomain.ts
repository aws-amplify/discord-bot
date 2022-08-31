import { Tags } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'

export type AmplifyAwsSubdomainProps = {
  hostedZoneName: string
  hostedZoneId: string
}

export class AmplifyAwsSubdomain extends Construct {
  private readonly appName: string = this.node.tryGetContext('name')
  private readonly envName: string = this.node.tryGetContext('env')
  public readonly hostedZone: route53.HostedZone
  public readonly certificate: acm.Certificate
  public readonly domainName: string
  public readonly domainNames: string[]

  constructor(scope: Construct, id: string, props: AmplifyAwsSubdomainProps) {
    super(scope, id)

    const { hostedZoneName, hostedZoneId } = props

    Tags.of(this).add('app:name', this.appName)

    // import manually created hosted zone (we do not need to manage this environment-agnostic resource)
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'ImportedHostedZone',
      {
        zoneName: hostedZoneName,
        hostedZoneId,
      }
    )

    // create a domain name scoped to the app env
    const domainName = hostedZoneName
    const domainNames = [domainName]

    // create an env-specific certificate to later be applied to the CloudFront distribution
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    })
    // apply env-specific tag to certificate resource
    Tags.of(certificate).add('app:env', this.envName)

    this.hostedZone = hostedZone as route53.HostedZone
    this.certificate = certificate
    this.domainName = domainName
    this.domainNames = domainNames
  }
}
