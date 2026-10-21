const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Supabase REST endpoint:', supabaseUrl)

async function testEndpoint(path) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}?select=*&limit=5`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await res.json()
  return { status: res.status, data }
}

async function main() {
  const settings = await testEndpoint('site_settings')
  console.log('site_settings result:', settings.status, Array.isArray(settings.data) ? `Found ${settings.data.length} rows` : settings.data)

  const categories = await testEndpoint('categories')
  console.log('categories result:', categories.status, Array.isArray(categories.data) ? `Found ${categories.data.length} rows` : categories.data)

  const adminProfiles = await testEndpoint('admin_profiles')
  console.log('admin_profiles result:', adminProfiles.status, Array.isArray(adminProfiles.data) ? `Found ${adminProfiles.data.length} rows` : adminProfiles.data)
}

main().catch(console.error)
