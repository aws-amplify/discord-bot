import { z } from 'zod'

/**
 * @TODO centralized feature "model"
 */

export const featureSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
  isEnabled: z.boolean(),
})

export type FeatureProps = z.infer<typeof featureSchema>

export class Feature {
  constructor(props: FeatureProps) {
    featureSchema.parse(props)
    Object.assign(this, props)
  }
}
