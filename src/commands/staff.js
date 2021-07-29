export const config = {
  name: 'staff',
  description: 'Toggles staff role to tagged user',
  default_permission: false,
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
  return '🤢 not implemented'
}
