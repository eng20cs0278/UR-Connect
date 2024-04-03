'use client' //user enter data from frontend

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'

const Providers = ({ children } : { children: React.ReactNode }) => {
  const queryClient = new QueryClient()

  return (
    //manage queries-fetch and cache data, session
    <QueryClientProvider client={queryClient}> 
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  )
}

export default Providers

