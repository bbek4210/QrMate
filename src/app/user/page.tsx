'use client'

import dynamic from 'next/dynamic'

const UserProfile = dynamic(() => import('@/pages/UserProfile'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center gap-4 grow">
      <div className="animate-pulse bg-gray-700 rounded-[36px] w-[100px] h-[100px]"></div>
      <div className="animate-pulse bg-gray-700 h-8 w-48 rounded"></div>
    </div>
  )
})

export default function UserProfilePage() {
  return <UserProfile />
} 