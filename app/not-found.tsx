import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-sans">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600 mt-2">Página não encontrada.</p>
      <Link href="/" className="mt-4 px-4 py-2 bg-black text-white rounded-lg">
        Voltar ao Início
      </Link>
    </div>
  )
}
