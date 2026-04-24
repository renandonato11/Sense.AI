import "./globals.css";
import { LayoutDashboard, Settings, TrendingUp, LogOut, CreditCard } from "lucide-react"; // Adicionado CreditCard aqui ✅
import Link from "next/link";
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased bg-slate-50 text-slate-900 font-sans">
        
        <Toaster position="top-right" richColors />

        <div className="flex h-screen overflow-hidden">
          {/* SIDEBAR */}
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h1 className="text-xl font-bold text-blue-600 tracking-tight">Sense.Ai</h1>
              <p className="text-xs text-slate-400">Enterprise Edition</p>
            </div>
            
            {/* MENU ÚNICO E LIMPO */}
            <nav className="flex-1 p-4 space-y-2">
              <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all font-medium">
                <LayoutDashboard size={20} /> Overview
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all font-medium">
                <Settings size={20} /> Configurações
              </Link>
              <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all font-medium">
                <TrendingUp size={20} /> Analytics
              </Link>
              
              {/* Link de Assinatura - Agora funcionando! */}
              <Link href="/billing" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all font-medium">
                <CreditCard size={20} /> Assinatura
              </Link>
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all font-//medium">
                <LogOut size={20} /> Sair
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-y-auto h-full">
            {children}
          </main>
        </div>
      </body>
    </html >
  );
}
