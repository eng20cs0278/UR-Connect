import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { CommunityValidator } from '@/lib/validators/community'
import { z } from 'zod'

//in api, write in try catch to handle errors
export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    //no user
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    //get value and validate
    const body = await req.json()
    const { name } = CommunityValidator.parse(body)

    // check if community already exists
    const communityExists = await db.community.findFirst({
      where: {
        name,
      },
    })

    if (communityExists) {
      return new Response('Community already exists', { status: 409 }) //name conflict
    }

    // create community and associate it with the user
    const community = await db.community.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    })

    // creator also has to be subscribed
    await db.subscription.create({
      data: {
        userId: session.user.id,
        communityId: community.id,
      },
    })

    return new Response(community.name)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 })
    }

    return new Response('Could not create community', { status: 500 })
  }
}
