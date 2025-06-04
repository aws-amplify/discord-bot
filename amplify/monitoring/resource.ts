import { CfnGraphQLApi } from "aws-cdk-lib/aws-appsync";
import { CfnWebACL } from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";
import {
  Canary,
  Code,
  Runtime,
  Schedule,
  Test,
} from "aws-cdk-lib/aws-synthetics";
import { Duration } from "aws-cdk-lib";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MonitoringStackProps {
  waf: CfnWebACL;
  appsyncApi: CfnGraphQLApi;
}

export class MonitoringStack extends Construct {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id);

    this.unAuthCanary({
      endpoint: props.appsyncApi.attrGraphQlUrl,
    });
  }

  private unAuthCanary({ endpoint }: { endpoint: string }) {
    new Canary(this, "UnauthorizedAccessCanary", {
      schedule: Schedule.rate(Duration.minutes(30)),
      test: Test.custom({
        code: Code.fromAsset(path.join(__dirname, "scripts", "unauth")),
        handler: "401.handler",
      }),
      runtime: Runtime.SYNTHETICS_NODEJS_PUPPETEER_9_1,
      startAfterCreation: true,
      environmentVariables: {
        ENDPOINT: endpoint,
      },
    });
  }
}
