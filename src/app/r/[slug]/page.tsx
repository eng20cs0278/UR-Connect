import MiniCreatePost from '@/components/MiniCreatePost'
import PostFeed from '@/components/PostFeed'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

//slug any name /r/create/any name
interface PageProps {
  //folder name - slug
  params: {
    slug: string
  }
}

const page = async ({ params }: PageProps) => {
  const { slug } = params

  const session = await getAuthSession()

  //find user
  const community = await db.community.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          community: true,
        },
        orderBy: {
          createdAt: 'desc' //recent posts at top
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  })

  //if user is not there, not found
  if (!community) return notFound()

  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl h-14 text-slate-300'>
        {community.name}
      </h1>
      <MiniCreatePost session={session} />
      {/* TODO: Show posts in user feed */}
      <PostFeed initialPosts={community.posts} communityName={community.name} />
    </>
  )
}

export default page
