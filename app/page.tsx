import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Home from './components/home/Home';

export default async function Page() {
  const cookieStore = await cookies();
  const verified = cookieStore.get('ageVerified')?.value === 'true';

  if (!verified) {
    redirect('/age-gate?redirect=/');
  }

  return <Home />;
}
