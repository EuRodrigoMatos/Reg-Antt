import { useState } from 'react'
import axios from 'axios'
import { Search, Package } from 'lucide-react'

export default function ProductSearch({ setResultado, setErro, carregando, setCarregando }) {
  const [termo, setTermo] = useState('')
  const [modo, setModo] = useState('nome')
  const [sugestoes, setSugestoes] = useState([])
  const [buscando, setBuscando] = useState(false)

  async function buscar(e) {
    e.preventDefault()
    if (!termo.trim()) return

    setCarregando(true)
    setErro(null)
    setResultado(null)
    setSugestoes([])

    try {
      if (modo === 'onu') {
        const res = await axios.get(`/api/search/onu/${termo.trim()}`)
        const produto = res.data
        const analise = await axios.post('/api/analyze/simular', {
          produtos: [{ onu: produto.onu, quantidade: 1, unidade: produto.estadoFisico === 'G' ? 'CIL' : produto.estadoFisico === 'S' ? 'KG' : 'L' }]
        })
        setResultado({ tipo: 'produto-unico', produto, analise: analise.data })
      } else {
        const res = await axios.get(`/api/search/nome?q=${encodeURIComponent(termo)}`)
        if (res.data.length === 1) {
          const produto = res.data[0]
          const analise = await axios.post('/api/analyze/simular', {
            produtos: [{ onu: produto.onu, quantidade: 1, unidade: produto.estadoFisico === 'G' ? 'CIL' : produto.estadoFisico === 'S' ? 'KG' : 'L' }]
          })
          setResultado({ tipo: 'produto-unico', produto, analise: analise.data })
        } else if (res.data.length > 1) {
          setSugestoes(res.data)
        } else {
          setErro('Produto não encontrado. Tente buscar pelo número ONU ou use termos mais específicos.')
        }
      }
    } catch (e) {
      setErro(e.response?.data?.erro || 'Produto não encontrado na base de dados.')
    } finally {
      setCarregando(false)
    }
  }

  async function selecionarSugestao(produto) {
    setSugestoes([])
    setTermo(produto.nomeOficial)
    setCarregando(true)
    try {
      const analise = await axios.post('/api/analyze/simular', {
        produtos: [{ onu: produto.onu, quantidade: 1, unidade: produto.estadoFisico === 'G' ? 'CIL' : produto.estadoFisico === 'S' ? 'KG' : 'L' }]
      })
      setResultado({ tipo: 'produto-unico', produto, analise: analise.data })
    } catch (e) {
      setErro(e.response?.data?.erro || 'Erro ao carregar dados do produto.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Search size={20} className="text-orange-500" />
        Busca por Produto
      </h2>

      <div className="flex gap-3 mb-4">
        {[['nome', 'Por Nome / Produto'], ['onu', 'Por Número ONU']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setModo(id); setSugestoes([]) }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
              modo === id
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={buscar} className="flex gap-2">
        <input
          type="text"
          value={termo}
          onChange={e => setTermo(e.target.value)}
          placeholder={modo === 'onu' ? 'Ex: 1202, 3082, 2902...' : 'Ex: diesel, glifosato, cipermetrina...'}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button type="submit" className="btn-primary px-6" disabled={carregando || !termo.trim()}>
          {carregando ? '...' : <Search size={18} />}
        </button>
      </form>

      {sugestoes.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">{sugestoes.length} produto(s) encontrado(s). Selecione:</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sugestoes.map(p => (
              <button
                key={p.onu}
                onClick={() => selecionarSugestao(p)}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
                    ONU {p.onu}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.nomeOficial}</p>
                    <p className="text-xs text-gray-500">Classe {p.classe} · {p.categoria}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    p.relevancia > 50 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.relevancia > 50 ? 'Alta relevância' : 'Possível'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {['1202', '1203', '3082', '3077', '2902', '1942'].map(onu => (
          <button
            key={onu}
            onClick={() => { setTermo(onu); setModo('onu') }}
            className="text-xs bg-gray-100 hover:bg-orange-50 hover:text-orange-700 border border-gray-200 hover:border-orange-300 rounded-lg px-3 py-2 transition-colors flex items-center gap-1"
          >
            <Package size={12} />
            ONU {onu}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1">Atalhos rápidos: produtos mais comuns</p>
    </div>
  )
}
