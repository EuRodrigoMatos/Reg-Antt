import { useState } from 'react'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import ProductSearch from './components/ProductSearch'
import Simulacao from './components/Simulacao'
import Results from './components/Results'
import { AlertTriangle } from 'lucide-react'

export default function App() {
  const [aba, setAba] = useState('busca')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)

  function limpar() {
    setResultado(null)
    setErro(null)
  }

  const abas = [
    { id: 'busca', label: 'Busca por Produto' },
    { id: 'nfe', label: 'Nota Fiscal (XML/PDF)' },
    { id: 'simulacao', label: 'Simulação de Carga' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {abas.map(a => (
            <button
              key={a.id}
              onClick={() => { setAba(a.id); limpar() }}
              className={`px-5 py-3 font-medium text-sm rounded-t-lg transition-colors -mb-px border-b-2 ${
                aba === a.id
                  ? 'border-orange-500 text-orange-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {erro && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-semibold text-red-700">Erro</p>
              <p className="text-red-600 text-sm">{erro}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
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
      </main>

      <footer className="text-center text-xs text-gray-400 pb-6 pt-2">
        Sistema ANTT — Ref.: Resolução ANTT 5.998/2022 | ABNT NBR 7500/7503/9735 | Lista ONU 2023
      </footer>
    </div>
  )
}
