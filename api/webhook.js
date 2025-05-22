module.exports = async (req, res) => {
  const event = req.body;
  console.log('🔔 Supertab Webhook:', JSON.stringify(event, null, 2));

  if (event.type === 'onetime_offering.purchasing_completed.v2025-04-01') {
    const offering = event.data;
    const { post_id } = offering.metadata || {};
    console.log(`✅ Access granted for post ${post_id}`);
  }

  res.status(200).json({ received: true });
};