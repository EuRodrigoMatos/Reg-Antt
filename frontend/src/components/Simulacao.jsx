import { useState } from 'react'
import axios from 'axios'
import { Plus, Trash2, PlayCircle, Search } from 'lucide-react'

export default function Simulacao({ setResultado, setErro, carregando, setCarregando }) {
  const [itens, setItens] = useState([{ onu: '', quantidade: '', unidade: 'L', buscando: false, produto: null }])

  function addItem() {
    setItens(prev => [...prev, { onu: '', quantidade: '', unidade: 'L', buscando: false, produto: null }])
  }

  function removeItem(i) {
    setItens(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateItem(i, campo, valor) {
    setItens(prev => prev.map((item, idx) =>
      idx === i ? { ...item, [campo]: valor, produto: campo === 'onu' ? null : item.produto } : item
    ))
  }

  async function buscarONU(i) {
    const item = itens[i]
    if (!item.onu.trim()) return
    setItens(prev => prev.map((it, idx) => idx === i ? { ...it, buscando: true } : it))
    try {
      const res = await axios.get(`/api/search/onu/${item.onu.trim()}`)
      const unidade = res.data.estadoFisico === 'G' ? 'CIL' : res.data.estadoFisico === 'S' ? 'KG' : 'L'
      setItens(prev => prev.map((it, idx) =>
        idx === i ? { ...it, produto: res.data, unidade, buscando: false } : it
      ))
    } catch {
      setItens(prev => prev.map((it, idx) => idx === i ? { ...it, produto: null, buscando: false } : it))
      setErro(`ONU ${item.onu} não encontrado na base de dados.`)
    }
  }

  async function simular() {
    const itensValidos = itens.filter(it => it.onu && it.produto)
    if (itensValidos.length === 0) {
      setErro('Adicione ao menos um produto válido (busque o ONU antes de simular).')
      return
    }
    setCarregando(true)
    setErro(null)
    setResultado(null)
    try {
      const res = await axios.post('/api/analyze/simular', {
        produtos: itensValidos.map(it => ({
          onu: it.onu,
          quantidade: parseFloat(it.quantidade) || 1,
          unidade: it.unidade
        }))
      })
      setResultado({ tipo: 'simulacao', analise: res.data })
    } catch (e) {
      setErro(e.response?.data?.erro || 'Erro na simulação.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="card">
      <p className="text-sm text-slate-700/70 mb-4">
        Adicione todos os produtos perigosos que serão transportados juntos para verificar compatibilidade e requisitos.
      </p>

      <div className="space-y-3">
        {itens.map((item, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={item.onu}
                    onChange={e => updateItem(i, 'onu', e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && buscarONU(i)}
                    placeholder="ONU (ex: 1202)"
                    maxLength={4}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono
                               focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 transition-colors"
                  />
                  <button
                    onClick={() => buscarONU(i)}
                    disabled={!item.onu || item.buscando}
                    className="px-2.5 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors disabled:opacity-40"
                    title="Buscar ONU"
                  >
                    <Search size={16} />
                  </button>
                </div>
                <input
                  type="number"
                  value={item.quantidade}
                  onChange={e => updateItem(i, 'quantidade', e.target.value)}
                  placeholder="Quantidade"
                  min="0"
                  step="0.01"
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm
                             focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 transition-colors"
                />
                <select
                  value={item.unidade}
                  onChange={e => updateItem(i, 'unidade', e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm
                             focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 transition-colors"
                >
                  <option value="L">L (Litros)</option>
                  <option value="KG">KG (Quilos)</option>
                  <option value="UN">UN (Unidades)</option>
                  <option value="CIL">CIL (Cilindros)</option>
                  <option value="TON">TON (Toneladas)</option>
                </select>
              </div>
              {itens.length > 1 && (
                <button
                  onClick={() => removeItem(i)}
                  className="text-slate-200 hover:text-red-500 mt-1 p-1 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {item.produto && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="font-mono bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">
                  ONU {item.produto.onu}
                </span>
                <span className="text-slate-800 font-semibold">{item.produto.nomeOficial}</span>
                <span className="text-slate-700/60">· Classe {item.produto.classe} · NR: {item.produto.numeroRisco}</span>
              </div>
            )}

            {item.buscando && (
              <p className="text-xs text-slate-700/50 mt-1">Buscando ONU {item.onu}...</p>
            )}

            {!item.produto && item.onu && !item.buscando && (
              <p className="text-xs text-yellow-600 mt-1">
                Clique em <Search size={10} className="inline" /> para validar o ONU
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={addItem}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 border border-primary-300 hover:border-primary-500 hover:bg-primary-50 px-4 py-2.5 rounded-lg transition-colors font-semibold"
        >
          <Plus size={16} />
          Adicionar Produto
        </button>
        <button
          onClick={simular}
          disabled={carregando || !itens.some(it => it.produto)}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <PlayCircle size={18} />
          {carregando ? 'Simulando...' : 'Simular Carga'}
        </button>
      </div>
    </div>
  )
}
