'use client';

import { DescriptionList } from '@/components/DescriptionList';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Daily Harvest Descriptions</h1>
      <DescriptionList />
    </main>
  );
}
