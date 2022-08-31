# CDK

1. `pnpm cdk bootstrap`
2. create Hosted Zone manually (if using Route53 with subdomain)
3. create key pair (pem) manually `support-box-key-<env>`
4. create setup secret `/app/<name>/_setup/secret/HOSTED_ZONE_ID`
5. create setup secret `/app/<name>/_setup/secret/HOSTED_ZONE_NAME`
6. `pnpm cdk synth -c env=next`
7. `pnpm cdk deploy -c env=next`

Setup parameter for manually configured Hosted Zone (for amplify.aws subdomain)
