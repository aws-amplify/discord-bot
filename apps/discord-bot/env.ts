import { z } from 'zod'

const envSchema = z.object({
  DISCORD_TOKEN: z.string(),
  DISCORD_GUILD_ID: z.string(),
  DISCORD_APP_ID: z.string(),
})

export type ProcessEnv = z.infer<typeof envSchema>
export const env = envSchema.parse(process.env)
