import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/dashboard-client';
import type {
  DashboardProfileRecord,
  DashboardSyllabusRecord,
  DashboardThesisRecord,
} from '@/lib/eden-types';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="feature-page">
        <div className="card">
          <h1 className="page-header">Dashboard</h1>
          <p className="mt-3 text-text-secondary">
            Supabase environment variables are required before the dashboard can load.
          </p>
        </div>
      </div>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in?next=/dashboard');
  }

  const [{ data: profileRows }, { data: thesisRows }, { data: syllabusRows }] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', user.id).limit(1),
    supabase
      .from('thesis_drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1),
    supabase
      .from('syllabus_data')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  const profile = (profileRows?.[0] ?? null) as DashboardProfileRecord | null;
  const thesis = (thesisRows?.[0] ?? null) as DashboardThesisRecord | null;
  const syllabus = (syllabusRows?.[0] ?? null) as DashboardSyllabusRecord | null;

  return <DashboardClient profile={profile} thesis={thesis} syllabus={syllabus} />;
}
