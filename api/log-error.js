// Vercel serverless function to log errors from the extension
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { error, context, timestamp, userAgent, extensionVersion } = req.body;

    // Log to Vercel's console (visible in dashboard)
    console.error('Extension Error:', {
      timestamp: timestamp || new Date().toISOString(),
      error,
      context,
      userAgent,
      extensionVersion
    });

    // TODO: In production, you might want to:
    // - Send to a database (Vercel Postgres, MongoDB, etc.)
    // - Send to error tracking service (Sentry, LogRocket, etc.)
    // - Send email alerts for critical errors

    return res.status(200).json({ success: true, logged: true });
  } catch (err) {
    console.error('Failed to log error:', err);
    return res.status(500).json({ error: 'Failed to log error' });
  }
}
