exports.bank = new Map([
  [
    'hello',
    {
      config: {
        name: 'hello',
        description: 'say hello',
      },
      handler: async event => 'Hello, World!',
    },
  ],
])
