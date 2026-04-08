/**
 * Cloudflare Pages Function - API reverse proxy
 *
 * Proxies /api/* requests to backend server.
 * Route: /api/:path*
 */

const BACKEND_URL = 'http://xg.789shouyou.com'

export async function onRequest(context) {
  const { request } = context

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const url = new URL(request.url)
  // Strip leading /api from path since the backend expects /api/...
  const apiPath = url.pathname + url.search

  const headers = new Headers(request.headers)
  headers.set('Host', new URL(BACKEND_URL).host)
  headers.delete('cookie')

  try {
    const response = await fetch(BACKEND_URL + apiPath, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    })

    const responseHeaders = new Headers(response.headers)
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Backend unavailable: ' + error.message }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      },
    )
  }
}
