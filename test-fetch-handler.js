
const { handler } = require('./netlify/functions/fetch-html');

(async () => {
  const result = await handler({
    httpMethod: 'GET',
    queryStringParameters: { url: 'https://example.com' }
  });
  if (result.statusCode !== 200) throw new Error(result.body);
  const payload = JSON.parse(result.body);
  if (!payload.html.includes('<html')) throw new Error('Expected HTML response');
  console.log(`Fetched ${payload.html.length} HTML characters.`);

  const merchant = await handler({
    httpMethod: 'GET',
    queryStringParameters: { url: 'https://www.merchantgenius.io/shop/url/certifiedshops.org' }
  });
  if (merchant.statusCode !== 200) throw new Error(merchant.body);
  const merchantPayload = JSON.parse(merchant.body);
  if (!/publicly registered domain name for this store is/i.test(merchantPayload.html)) {
    throw new Error('Merchant Genius marker not found');
  }
  console.log('Merchant Genius page fetched and marker found.');
})();
