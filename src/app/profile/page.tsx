'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ProfileContent component with client-side rendering only
const ProfileContent = dynamic(
  () => import('@/components/profile/ProfileContent'),
  { ssr: false }
);

export default function ProfilePage() {
  return <ProfileContent />;
} 