# Deployment Process

The following diagram servers as an example for deploying the environment `main` (the production environment). When working with multiple environments it is recommended to have separate dotenv files for each environment. In the following example secrets will be loaded from `.env` then `.env.main` using [Vite's `loadEnv` helper](https://vitejs.dev/config/#environment-variables).

```mermaid
stateDiagram-v2
  pinstall: pnpm install
  pbuild: pnpm build
  ssm: Are secrets created in SSM?
  createsecrets: run `pnpm scripts create-secrets -e main`
  cdkSynth: cdk synth --context env=main
  cdkDeploy: cdk deploy --context env=main

  pinstall --> pbuild
  pbuild --> ssm
  ssm --> yes
  ssm --> no
  no --> createsecrets

  yes --> cdkSynth
  createsecrets --> cdkSynth
  cdkSynth --> cdkDeploy
```
