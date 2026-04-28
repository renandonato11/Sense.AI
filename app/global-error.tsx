"use client"

import 'react-dom'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen font-sans">
          <h1 className="text-4xl font-bold">Algo deu errado!</h1>
          <p className="text-gray-600 mt-2 mb-4">Ocorreu um erro inesperado no sistema.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
