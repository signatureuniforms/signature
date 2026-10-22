import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Settings | Signature Uniforms',
}

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('site_settings').select('*')

  const initialSettings: Record<string, string> = {}
  if (data && Array.isArray(data)) {
    data.forEach((item: { key: string; value: string | null }) => {
      if (item.value !== null && item.value !== undefined) {
        initialSettings[item.key] = item.value
      }
    })
  }

  return <SettingsForm initialSettings={initialSettings} />
}
