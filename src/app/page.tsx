import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/pt/harvests');
  return null;
}
