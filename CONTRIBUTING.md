# Contributing

Refer to the [readme guide](./README.md#development) to get set up for local development.

## Repository Reference

- [`apps/`](./apps) - collection of apps that use the library packages in `packages/`
- [`cdk/`](./cdk) - AWS CDK application to deploy apps
- [`e2e/`](./e2e) - End-to-end test suite powered by [Vitest](https://vitest.dev/), supports in-source unit testing
- [`packages/`](./packages) - collection of library packages, including Discord, support helpers, and a shared TypeScript configuration
- [`scripts/`](./scripts) - small CLI helper for automating tasks

## Authoring Discord Commands

To get started, let's create a new command file in `apps/bot/src/commands`: `hello.ts`

```ts
import { createCommand } from '../Command.js'
import { createOption } from '../CommandOption.js'

const name = createOption({
  name: 'name',
  description: 'The name of the user to greet.',
  required: true,
  choices: ['world', 'everyone'],
})

export default createCommand({
  name: 'hello',
  description: 'Say hello',
  options: [name],
  handler: (context) => {
    const [name] = context.data.options
    return `hello ${name.value}`
  },
})
```

Save and register the new command with `commands.sync()`

**NOTE**: allow about 30 minutes for commands to show in Discord

## Creating Secrets in SSM

**[scripts](./scripts)**

Create secrets in SSM Parameter Store with the `scripts` helper! Rename `.env.sample` to `.env.next` and create secrets with the following command:

```bash
pnpm scripts create-secrets -e next
```

**NOTE:** dotenv files are loaded using Vite's `loadEnv` and `local` dotenv files are not supported when creating secrets. We must be sure to pass a valid environment name such as `main` or `next`

## Deployment

For the deployment we will work primarily in the [`cdk`](./cdk) directory, where the [AWS CDK CLI](https://www.npmjs.com/package/aws-cdk) is installed locally to the package.

1. if not already done, bootstrap the environment with `pnpm cdk bootstrap`
2. ensure we are able to synthesize the stack: `pnpm cdk synth`
   1. alternatively we can synthesize an environment-specific stack: `pnpm cdk synth -c env=next`
3. deploy the stack with `pnpm cdk deploy --all`

### Typical Workflow

Deploy for environment `next`

1. `pnpm cdk synth -c env=next`
2. `pnpm cdk deploy -c env=next --all`

Destroy resources associated with environment `next`

1. `pnpm cdk destroy -c env=next --all`

## Testing

Run the test suite with `pnpm test`.

### Unit Tests

This project supports [in-source testing powered by Vitest](https://vitest.dev/guide/in-source.html). To get started, at the **end of the file** add the following:

```ts
// ... implementation

if (import.meta.vitest) {
  const { test } = import.meta.vitest
  test.todo('my unit test')
}
```

When `pnpm test` is run from the project root, the newly added test is executed alongside the e2e tests.
