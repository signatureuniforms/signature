const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || 'Admin@gmail.com'
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'Admin@123'

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const headers = {
  'apikey': serviceKey,
  'Authorization': `Bearer ${serviceKey}`,
  'Content-Type': 'application/json',
}

async function bootstrapAdmin() {
  console.log(`Checking / creating admin user: ${adminEmail}`)

  // 1. List users to see if admin already exists
  const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, { headers })
  if (!listRes.ok) {
    const errText = await listRes.text()
    console.error('Error listing auth users:', errText)
    return
  }
  const { users } = await listRes.json()
  let adminUser = users.find(u => u.email?.toLowerCase() === adminEmail.toLowerCase())

  if (!adminUser) {
    console.log('User does not exist, creating new auth user...')
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { role: 'admin', name: 'Signature Admin' },
      }),
    })
    if (!createRes.ok) {
      console.error('Error creating auth user:', await createRes.text())
      return
    }
    adminUser = await createRes.json()
    console.log('Created auth user with ID:', adminUser.id)
  } else {
    console.log('User exists in auth.users with ID:', adminUser.id)
    // Update password to ensure it matches
    const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${adminUser.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        password: adminPassword,
        email_confirm: true,
      }),
    })
    if (!updateRes.ok) {
      console.warn('Could not update password:', await updateRes.text())
    } else {
      console.log('Password verified / updated successfully.')
    }
  }

  // 2. Check admin_profiles table
  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/admin_profiles?user_id=eq.${adminUser.id}&select=*`,
    { headers }
  )

  if (!profileRes.ok) {
    console.warn('admin_profiles query error:', await profileRes.text())
    return
  }

  const profiles = await profileRes.json()
  const existingProfile = profiles[0]

  if (!existingProfile) {
    console.log('Inserting admin profile into admin_profiles table...')
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/admin_profiles`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: adminUser.id,
        username: 'admin',
        display_name: 'Administrator',
        role: 'admin',
        is_active: true,
      }),
    })

    if (!insertRes.ok) {
      console.error('Error creating admin_profile:', await insertRes.text())
    } else {
      const newProfile = await insertRes.json()
      console.log('Admin profile created successfully:', newProfile)
    }
  } else {
    console.log('Admin profile already exists:', existingProfile)
    await fetch(`${supabaseUrl}/rest/v1/admin_profiles?id=eq.${existingProfile.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_active: true, role: 'admin' }),
    })
    console.log('Updated admin profile to role: admin and active.')
  }

  console.log('\n==========================================')
  console.log('Admin Setup Completed!')
  console.log(`Email:    ${adminEmail}`)
  console.log(`Password: ${adminPassword}`)
  console.log('==========================================\n')
}

bootstrapAdmin().catch(console.error)
