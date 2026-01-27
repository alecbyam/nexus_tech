import ProfilePage from '@/components/pages/ProfilePage'

// Force dynamic rendering (ProfilePage uses client components)
export const dynamic = 'force-dynamic'

export default function Profile() {
  return <ProfilePage />
}

