import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { CommunitySubscriptionValidator } from '@/lib/validators/community'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { communityId } = CommunitySubscriptionValidator.parse(body)

    // check if user has already subscribed to community
    const subscriptionExists = await db.subscription.findFirst({
      where: {
        communityId,
        userId: session.user.id,
      },
    })
    if (subscriptionExists) {
      return new Response("You've already subscribed to this community", {
        status: 400,
      })
    }

    // create community and associate it with the user - subscription added
    await db.subscription.create({
      data: {
        communityId,
        userId: session.user.id,
      },
    })

    return new Response(communityId)
  } catch (error) {
    (error)
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response(
      'Could not subscribe to community at this time. Please try later',
      { status: 500 }
    )
  }
}
