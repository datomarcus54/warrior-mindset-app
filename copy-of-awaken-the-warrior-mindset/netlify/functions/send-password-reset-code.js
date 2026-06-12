exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { email, code } = JSON.parse(event.body || '{}');
    if (!email || !code) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and code are required.' }) };
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESET_EMAIL_FROM || 'onboarding@resend.dev';

    if (!resendApiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'RESEND_API_KEY not configured on server.' }),
      };
    }

    const subject = 'Your Warrior Mindset Password Reset Code';
    const message = `Your reset code is: ${code}. This code expires in 15 minutes.`;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject,
        text: message,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Email send error:', errText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send reset code email.' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('send-password-reset-code error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
