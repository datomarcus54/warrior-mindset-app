const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, serviceKey };
};

const adminHeaders = (serviceKey) => ({
  Authorization: `Bearer ${serviceKey}`,
  apikey: serviceKey,
  'Content-Type': 'application/json',
});

const findUserByEmail = async (url, serviceKey, email) => {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const res = await fetch(
      `${url}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      { headers: adminHeaders(serviceKey) }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to look up user: ${errText}`);
    }

    const data = await res.json();
    const users = data.users || [];
    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (users.length < perPage) return null;
    page += 1;
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { email, code, newPassword } = JSON.parse(event.body || '{}');
    if (!email || !code || !newPassword) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email, code, and newPassword are required.' }) };
    }

    const { url, serviceKey } = getSupabaseConfig();
    if (!url || !serviceKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Supabase server credentials not configured.' }),
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const codeRes = await fetch(
      `${url}/rest/v1/password_reset_codes?email=eq.${encodeURIComponent(normalizedEmail)}&code=eq.${encodeURIComponent(code)}&select=email,code,expires_at`,
      { headers: adminHeaders(serviceKey) }
    );

    if (!codeRes.ok) {
      const errText = await codeRes.text();
      throw new Error(`Failed to verify reset code: ${errText}`);
    }

    const records = await codeRes.json();
    const record = records[0];
    if (!record) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid reset code. Please try again.' }) };
    }

    const expiresAt = new Date(record.expires_at);
    if (expiresAt.getTime() <= Date.now()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'This reset code has expired. Please request a new one.' }) };
    }

    const user = await findUserByEmail(url, serviceKey, normalizedEmail);
    if (!user) {
      return { statusCode: 404, body: JSON.stringify({ error: 'No account found for this email.' }) };
    }

    const updateRes = await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: adminHeaders(serviceKey),
      body: JSON.stringify({ password: newPassword }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error('Password update error:', errText);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update password.' }) };
    }

    const deleteRes = await fetch(
      `${url}/rest/v1/password_reset_codes?email=eq.${encodeURIComponent(normalizedEmail)}&code=eq.${encodeURIComponent(code)}`,
      { method: 'DELETE', headers: adminHeaders(serviceKey) }
    );

    if (!deleteRes.ok) {
      const errText = await deleteRes.text();
      console.error('Code delete error:', errText);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('complete-password-reset error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
