export const getCorsHeaders = (req) => {
  const origin = req.headers.origin;
  const requestedHeaders = req.headers['access-control-request-headers'];

  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      requestedHeaders || 'Content-Type, Authorization, X-API-Key, Accept, Origin, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
};

export const sendJson = (res, statusCode, payload, extraHeaders = {}, req = null) => {
  const corsHeaders = req ? getCorsHeaders(req) : {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, Accept, Origin, X-Requested-With',
  };

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders,
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
};

export const notFound = (res, method, path, req = null) =>
  sendJson(res, 404, { error: 'not_found', detail: `No route for ${method} ${path}` }, {}, req);

export const parseJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
};
