import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function GET(req: Request) {
  const url = new URL(req.url)

  const session = await getAuthSession()

  //to display communties followed by user
  let followedCommunitiesIds: string[] = []

  //if user is login, fetch all the community id
  if (session) {
    const followedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        community: true,
      },
    })

    followedCommunitiesIds = followedCommunities.map((sub) => sub.community.id)
  }

  try {
    //getting data safely from requests
    const { limit, page, communityName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        communityName: z.string().nullish().optional(), //optional
      })
      .parse({
        communityName: url.searchParams.get('communityName'),
        limit: url.searchParams.get('limit'),
        page: url.searchParams.get('page'),
      })

    let whereClause = {}

    //construct where class for prisma to determine which posts to be fetched - schema
    //if there is community name, provide that, orelse provied followed community ids
    if (communityName) {
      whereClause = {
        community: {
          name: communityName,
        },
      }
    } else if (session) {
      whereClause = {
        community: {
          id: {
            in: followedCommunitiesIds,
          },
        },
      }
    }

    //fetch posts - with whereclass to determine which posts should be fetched from database
    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit), // skip should start from 0 for page 1
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        community: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    })

    return new Response(JSON.stringify(posts))
  } catch (error) {
    return new Response('Could not fetch posts', { status: 500 })
  }
}
