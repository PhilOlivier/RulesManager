import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Layout from '@/components/layout/Layout'

export default async function ProtectedRoutesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login')
  }
  
  return <Layout>{children}</Layout>
}
