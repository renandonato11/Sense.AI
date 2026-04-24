import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Inicializa o cliente do Supabase para ler os cookies da sessão
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Verifica a sessão do usuário
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isAuthPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/signup')
  const isOnboardingPage = url.pathname.startsWith('/onboarding')
  const isDashboardPage = url.pathname.startsWith('/dashboard')

  // --- LÓGICA DE REDIRECIONAMENTO ---

  // A. Usuário NÃO autenticado tenta acessar áreas protegidas
  if (!user && (isDashboardPage || isOnboardingPage)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // B. Usuário autenticado tenta acessar páginas de login/signup
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // C. Verificação de Posse de Loja (O "Gatekeeper")
  if (user) {
    // Verificamos se o usuário possui alguma loja vinculada a ele
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    const hasStore = !!store

    // Se NÃO tem loja e está tentando acessar o dashboard -> Manda para o Onboarding
    if (!hasStore && isDashboardPage) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Se JÁ tem loja e tenta voltar para o onboarding -> Manda para o Dashboard
    if (hasStore && isOnboardingPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

// Define quais rotas o middleware deve monitorar
export const config = {
  matcher: [
    '/', // <--- ADICIONE ISSO: Protege a página inicial
    '/dashboard/:path*', 
    '/onboarding/:path*', 
    '/login', 
    '/signup'
  ],
}

