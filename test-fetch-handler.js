// Author: Shonibare Akanni

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
})();
