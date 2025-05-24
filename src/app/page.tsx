import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/harvests');
  return null;
}
