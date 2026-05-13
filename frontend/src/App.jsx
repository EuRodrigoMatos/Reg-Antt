import { useState } from 'react'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import ProductSearch from './components/ProductSearch'
import Simulacao from './components/Simulacao'
import Results from './components/Results'
import { AlertTriangle, Search, FileText, PlayCircle, X } from 'lucide-react'

const navItems = [
  { id: 'busca',     label: 'Busca por Produto',     icon: Search     },
  { id: 'nfe',       label: 'Nota Fiscal (XML/PDF)',  icon: FileText   },
  { id: 'simulacao', label: 'Simulação de Carga',     icon: PlayCircle },
]

export default function App() {
  const [aba, setAba] = useState('busca')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function trocarAba(id) {
    setAba(id)
    setResultado(null)
    setErro(null)
    setSidebarOpen(false)
  }

  function limpar() {
    setResultado(null)
    setErro(null)
  }

  const abaAtual = navItems.find(n => n.id === aba)

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 bottom-0 z-50 w-60 bg-primary-500 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:sticky lg:top-[76px] lg:h-[calc(100vh-76px)] lg:translate-x-0 lg:z-auto lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Mobile top bar */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-primary-700 lg:hidden">
            <img src="/logo.png" alt="Logo" className="h-9 w-9 object-contain rounded-lg" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-300 px-3 mb-3">
              Funcionalidades
            </p>
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => trocarAba(id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  aba === id
                    ? 'bg-primary-700 text-white'
                    : 'text-white/80 hover:bg-primary-700/60 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          {/* Footer da sidebar */}
          <div className="px-4 py-4 border-t border-primary-700">
            <p className="text-xs text-white/40 leading-relaxed">
              Resolução ANTT 5.998/2022<br />
              ABNT NBR 7500 / 7503 / 9735
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="max-w-4xl">
            {/* Page title */}
            {abaAtual && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
                  <abaAtual.icon size={22} className="text-primary-500" />
                  {abaAtual.label}
                </h2>
              </div>
            )}

            {erro && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-red-700 text-sm">Erro</p>
                  <p className="text-red-600 text-sm">{erro}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {aba === 'busca' && (
                <ProductSearch
                  setResultado={setResultado}
                  setErro={setErro}
                  carregando={carregando}
                  setCarregando={setCarregando}
                />
              )}
              {aba === 'nfe' && (
                <FileUpload
                  setResultado={setResultado}
                  setErro={setErro}
                  carregando={carregando}
                  setCarregando={setCarregando}
                />
              )}
              {aba === 'simulacao' && (
                <Simulacao
                  setResultado={setResultado}
                  setErro={setErro}
                  carregando={carregando}
                  setCarregando={setCarregando}
                />
              )}

              {resultado && (
                <Results resultado={resultado} onLimpar={limpar} />
              )}
            </div>
          </div>
        </main>
      </div>

      <footer className="text-center text-xs text-dark-700/50 pb-4 pt-3 border-t border-dark-100">
        Sistema ANTT — Ref.: Resolução ANTT 5.998/2022 | ABNT NBR 7500/7503/9735 | Lista ONU 2023
      </footer>
    </div>
  )
}
