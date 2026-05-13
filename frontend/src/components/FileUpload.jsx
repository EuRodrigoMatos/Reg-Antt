import { useState, useRef } from 'react'
import axios from 'axios'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'

export default function FileUpload({ setResultado, setErro, carregando, setCarregando }) {
  const [arquivo, setArquivo] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()

  function selecionarArquivo(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xml', 'pdf'].includes(ext)) {
      setErro('Formato inválido. Envie apenas arquivos XML (NF-e) ou PDF.')
      return
    }
    setArquivo(file)
    setErro(null)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    selecionarArquivo(e.dataTransfer.files[0])
  }

  async function analisar() {
    if (!arquivo) return
    setCarregando(true)
    setErro(null)
    setResultado(null)

    const formData = new FormData()
    formData.append('arquivo', arquivo)
    const tipo = arquivo.name.endsWith('.xml') ? 'xml' : 'pdf'

    try {
      const res = await axios.post(`/api/analyze/${tipo}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResultado({ tipo: 'nfe', dados: res.data })
    } catch (e) {
      setErro(e.response?.data?.erro || 'Erro ao processar o arquivo.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="card">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary-400 bg-primary-50'
            : 'border-slate-200 hover:border-primary-400 hover:bg-primary-50'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mx-auto mb-3 text-slate-200" size={36} />
        <p className="font-semibold text-slate-800">Arraste o arquivo aqui ou clique para selecionar</p>
        <p className="text-sm text-slate-700/60 mt-1">NF-e XML ou PDF — máx. 20 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xml,.pdf"
          className="hidden"
          onChange={e => selecionarArquivo(e.target.files[0])}
        />
      </div>

      {arquivo && (
        <div className="mt-4 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
          <FileText size={18} className="text-primary-500 shrink-0" />
          <span className="text-sm font-semibold text-slate-800 flex-1">{arquivo.name}</span>
          <span className="text-xs text-slate-700/50">{(arquivo.size / 1024).toFixed(0)} KB</span>
          <button onClick={() => setArquivo(null)} className="text-slate-200 hover:text-red-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
        <AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Para XML: a extração é automática e precisa. Para PDF: o texto é extraído automaticamente,
          mas confirme os produtos identificados, pois PDFs possuem layouts variáveis.
        </p>
      </div>

      <button
        className="btn-primary mt-4 w-full"
        onClick={analisar}
        disabled={!arquivo || carregando}
      >
        {carregando ? 'Analisando...' : 'Analisar Nota Fiscal'}
      </button>
    </div>
  )
}
