export const config = {
  name: 'staff',
  description: 'Toggles staff role to tagged user',
  default_permission: true,
  options: [
    {
      name: 'user',
      description: 'New staff member',
      type: 6,
      required: true,
    },
  ],
}

export async function handler(context) {
  console.log('CONTEXt', context, context.data.options, context.data.resolved)
  return '🤢 not implemented'
}
