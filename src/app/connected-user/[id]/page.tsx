'use client'

import ConnectedUser from '@/pages/ConnectedUser'

export default function ConnectedUserPage({ params }: { params: { id: string } }) {
  return <ConnectedUser id={params.id} />
} 