# @hey-amplify/discord

Discord helper package with shared code for bot and frontend apps. This package includes `ImportMetaEnv` types that extend Vite, and are required when consuming this package. For example, if we reference `import.meta.env.VITE_HOST` the built JavaScript code will include this reference which will be resolved upon building both the bot and frontend apps
