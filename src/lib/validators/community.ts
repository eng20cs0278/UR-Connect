import { z } from 'zod'

//zod - validator library - if any object passed, the data in schema is only retrived
// {name: "rak" ,age: 21} -> schema{name: } -> output{name: "rak"}
export const communityValidator = z.object({
  name: z.string().min(3).max(21),
})

export const CommunitySubscriptionValidator = z.object({
  communityId: z.string(),
})

export type CreateCommunityPayload = z.infer<typeof CommunityValidator>
export type SubscribeToCommunityPayload = z.infer<
  typeof CommunitySubscriptionValidator
>
