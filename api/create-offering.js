export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { SUPERTAB_CLIENT_ID, SUPERTAB_CLIENT_SECRET } = process.env;

  // Step 1: Get Bearer Token via client_credentials
  const tokenRes = await fetch('https://auth.supertab.co/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${SUPERTAB_CLIENT_ID}:${SUPERTAB_CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'mapi:write'
    })
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error('❌ Failed to get access token:', tokenData);
    return res.status(500).json({ error: 'Failed to authenticate with Supertab' });
  }

  const accessToken = tokenData.access_token;

  // Step 2: Create One-Time Offering
  const offeringRes = await fetch('https://tapi.supertab.co/mapi/onetime_offerings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-version': '2025-04-01',
      'x-supertab-client-id': SUPERTAB_CLIENT_ID,
      'Content-Type': 'application/json'
    },
body: JSON.stringify({
  currency_code: 'USD', // <-- top-level field required
  items: [
  {
    name: 'Post 42 Access',
    description: 'Unlock premium content for post.42',
    price_amount: 1.00,
    currency_code: 'USD',
    metadata: {
      content_key: 'post.42'
    }
  }
]
// optional: can remove or leave the root metadata
})
  });

  const offeringData = await offeringRes.json();

  if (!offeringRes.ok) {
    console.error('❌ Failed to create offering:', offeringData);
    return res.status(500).json({ error: 'Failed to create one-time offering', details: offeringData });
  }

  console.log('✅ Created offering:', offeringData);
  return res.status(200).json(offeringData);
}
