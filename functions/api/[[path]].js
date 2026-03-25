/**
 * Cloudflare Pages Function - API 反向代理
 *
 * 将 /api/* 请求转发到后端服务器，解决 HTTPS→HTTP 混合内容问题。
 * 路由: /api/:path*
 */

const BACKEND_URL = 'http://139.196.46.100:8000'

export async function onRequest(context) {
  const { request, params } = context
  const path = params.path ? params.path.join('/') : ''
  const url = new URL(request.url)

  const targetUrl = `${BACKEND_URL}/api/${path}${url.search}`

  const headers = new Headers(request.headers)
  headers.set('Host', new URL(BACKEND_URL).host)
  headers.delete('cookie')

  try {
    const response = await fetch(targetUrl, {
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
      JSON.stringify({ success: false, error: '后端服务不可用' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
