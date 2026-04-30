import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Definimos os headers de CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  // 2. Se for uma requisição do tipo OPTIONS (Preflight), respondemos imediatamente com os headers de CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  // 3. Para todas as outras requisições, permitimos que elas sigam para a API, 
  // mas adicionamos os headers de CORS na resposta
  const response = NextResponse.next()
  
  // Adicionamos os headers de CORS na resposta final
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Configura o middleware para rodar apenas nas rotas de API
export const config = {
  matcher: '/api/:path*',
}
