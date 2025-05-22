module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { SUPERTAB_CLIENT_ID, SUPERTAB_CLIENT_SECRET } = process.env;
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
  const accessToken = tokenData.access_token;

  const offering = await fetch('https://tapi.supertab.co/mapi/onetime_offerings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'x-supertab-client-id': SUPERTAB_CLIENT_ID,
      'x-api-version': '2025-04-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      currency_code: 'USD',
      items: [
        {
          name: 'Unlock Post 42',
          description: 'Access to premium content',
          price: {
            amount: 1.00,
            currency_code: 'USD'
          }
        }
      ],
      metadata: {
        post_id: '42'
      }
    })
  });

  const offeringData = await offering.json();
  res.status(200).json(offeringData);
};