import SafetyPanel from './SafetyPanel'
import RiskLabel from './RiskLabel'
import { CheckCircle, XCircle, AlertTriangle, Info, Truck, ShieldAlert, FileText, X } from 'lucide-react'

function BadgeClasse({ classe }) {
  const cores = {
    '2.1': 'bg-red-100 text-red-800',
    '2.2': 'bg-green-100 text-green-800',
    '2.3': 'bg-gray-100 text-gray-800 border border-gray-400',
    '3': 'bg-red-100 text-red-800',
    '4.1': 'bg-orange-100 text-orange-800',
    '4.2': 'bg-orange-100 text-orange-800',
    '4.3': 'bg-blue-100 text-blue-800',
    '5.1': 'bg-yellow-100 text-yellow-800',
    '5.2': 'bg-orange-100 text-orange-800',
    '6.1': 'bg-purple-100 text-purple-800',
    '6.2': 'bg-gray-100 text-gray-800',
    '7': 'bg-yellow-100 text-yellow-800',
    '8': 'bg-gray-100 text-gray-800',
    '9': 'bg-slate-100 text-slate-700'
  }
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cores[classe] || 'bg-gray-100 text-gray-700'}`}>
      Classe {classe}
    </span>
  )
}

function ProdutoCard({ produto, index }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-sm font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
              ONU {produto.onu}
            </span>
            <BadgeClasse classe={produto.classe} />
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              NR: {produto.numeroRisco}
            </span>
            {produto.grupoEmbalagem && produto.grupoEmbalagem !== 'N/A' && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                GE {produto.grupoEmbalagem}
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-900">{produto.nomeOficial}</p>
          <p className="text-xs text-gray-500 mt-0.5">{produto.categoria} · {produto.estadoFisico === 'L' ? 'Líquido' : produto.estadoFisico === 'S' ? 'Sólido' : 'Gás'}</p>
          {produto.observacoes && (
            <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded p-2">{produto.observacoes}</p>
          )}
          {produto.avisoDispensa && (
            <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
              {produto.avisoDispensa}
            </p>
          )}
          {produto.quantidadeTransportada > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Quantidade: <span className="font-semibold">{produto.quantidadeTransportada} {produto.unidade}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function CompatibilidadeSection({ compatibilidade }) {
  return (
    <div className={`rounded-xl p-4 border ${compatibilidade.compativel ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-300'}`}>
      <div className="flex items-center gap-2 mb-2">
        {compatibilidade.compativel
          ? <CheckCircle className="text-green-600" size={20} />
          : <XCircle className="text-red-600" size={20} />
        }
        <h3 className="font-semibold text-sm">
          {compatibilidade.compativel
            ? 'Produtos Compatíveis para Transporte Conjunto'
            : 'INCOMPATIBILIDADE DETECTADA — Transporte Conjunto PROIBIDO'
          }
        </h3>
      </div>
      {compatibilidade.conflitos?.map((c, i) => (
        <div key={i} className="mt-2 bg-red-100 border border-red-300 rounded-lg p-3 text-sm">
          <p className="font-bold text-red-800">
            ONU {c.produtoA.onu} ({c.produtoA.nome?.slice(0, 30)}) + ONU {c.produtoB.onu} ({c.produtoB.nome?.slice(0, 30)})
          </p>
          <p className="text-red-700 text-xs mt-1">{c.motivo}</p>
        </div>
      ))}
    </div>
  )
}

function RequisitosVeiculoSection({ requisitos }) {
  return (
    <div className="space-y-2">
      {requisitos.map((req, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <ShieldAlert size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">{req.tipo.replace(/_/g, ' ')}</p>
            <p className="text-sm text-blue-800">{req.descricao}</p>
          </div>
          {req.obrigatorio && (
            <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold shrink-0">
              OBRIG.
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function RotulosSection({ rotulos }) {
  return (
    <div>
      {rotulos.principais.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Rótulos de Risco Obrigatórios</p>
          <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
            {rotulos.principais.map(classe => (
              <RiskLabel key={classe} classe={classe} size={90} />
            ))}
          </div>
        </div>
      )}
      {rotulos.subsidiarios.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Rótulos Subsidiários</p>
          <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
            {rotulos.subsidiarios.map(classe => (
              <RiskLabel key={classe} classe={classe} size={70} subsidiario />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NormasSection({ normas }) {
  return (
    <div className="space-y-1">
      {normas.map((n, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
          <FileText size={14} className="text-gray-400 shrink-0" />
          {n}
        </div>
      ))}
    </div>
  )
}

function NFeProdutosSection({ produtos }) {
  const perigosos = produtos.filter(p => p.produtoPP)
  const normais = produtos.filter(p => !p.produtoPP)

  return (
    <div className="space-y-2">
      {perigosos.map((p, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertTriangle size={16} className="text-orange-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{p.nome}</p>
            <p className="text-xs text-gray-500">
              NCM: {p.ncm || 'N/A'} · {p.quantidade} {p.unidade}
            </p>
            {p.produtoPP && (
              <p className="text-xs text-orange-700 font-semibold mt-0.5">
                Identificado como: ONU {p.produtoPP.onu} — {p.produtoPP.nomeOficial}
                {p.confiancaMatch < 50 && ' (verificar)'}
              </p>
            )}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
            p.confiancaMatch > 60 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {p.confiancaMatch > 60 ? 'Confirmado' : 'Verificar'}
          </span>
        </div>
      ))}
      {normais.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2">{normais.length} produto(s) sem classificação perigosa</p>
          {normais.map((p, i) => (
            <div key={i} className="flex items-center gap-2 p-2 text-sm text-gray-600">
              <CheckCircle size={14} className="text-green-500 shrink-0" />
              {p.nome}
              {p.ncm && <span className="text-xs text-gray-400">NCM: {p.ncm}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Results({ resultado, onLimpar }) {
  if (!resultado) return null

  const { tipo, analise, produto, dados } = resultado

  const analiseData = analise || dados?.analise
  const produtosNFe = dados?.nfe?.produtos

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="text-orange-500" size={24} />
          Resultado da Análise
        </h2>
        <button onClick={onLimpar} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {tipo === 'nfe' && dados && (
        <div className="card">
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <FileText size={16} className="text-gray-500" />
            Dados da Nota Fiscal
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
            {dados.nfe?.numero && (
              <div><p className="text-xs text-gray-500">Nº NF</p><p className="font-semibold">{dados.nfe.numero}</p></div>
            )}
            {dados.nfe?.emitente?.nome && (
              <div><p className="text-xs text-gray-500">Emitente</p><p className="font-semibold truncate">{dados.nfe.emitente.nome}</p></div>
            )}
            {dados.nfe?.destinatario?.nome && (
              <div><p className="text-xs text-gray-500">Destinatário</p><p className="font-semibold truncate">{dados.nfe.destinatario.nome}</p></div>
            )}
            <div>
              <p className="text-xs text-gray-500">Produtos Perigosos</p>
              <p className={`font-bold ${dados.produtosPerigososIdentificados > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {dados.produtosPerigososIdentificados} de {dados.totalProdutos}
              </p>
            </div>
          </div>

          {produtosNFe && <NFeProdutosSection produtos={produtosNFe} />}

          {dados.aviso && (
            <div className="mt-3 flex gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">{dados.aviso}</p>
            </div>
          )}

          {!dados.temProdutosPerigosos && (
            <div className="mt-4 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="text-green-600" size={20} />
              <p className="text-green-800 font-medium">Nenhum produto perigoso identificado nesta Nota Fiscal.</p>
            </div>
          )}
        </div>
      )}

      {!analiseData && !dados?.temProdutosPerigosos && tipo === 'nfe' && null}

      {analiseData && (
        <>
          {analiseData.compatibilidade && analiseData.produtos?.length > 1 && (
            <CompatibilidadeSection compatibilidade={analiseData.compatibilidade} />
          )}

          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ShieldAlert size={18} className="text-orange-500" />
              Painel de Segurança Obrigatório
            </h3>
            <SafetyPanel painel={analiseData.painel} tamanho="lg" />
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Rótulos de Risco (ABNT NBR 7500)</h3>
            <RotulosSection rotulos={analiseData.rotulos} />
          </div>

          {analiseData.produtos?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4">Produtos Perigosos Identificados</h3>
              <div className="space-y-3">
                {analiseData.produtos.map((p, i) => (
                  <ProdutoCard key={i} produto={p} index={i} />
                ))}
              </div>
            </div>
          )}

          {tipo === 'produto-unico' && produto && (
            <div className="card">
              <h3 className="font-semibold mb-4">Detalhes do Produto</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div><p className="text-xs text-gray-500">Número ONU</p><p className="font-bold text-orange-600">{produto.onu}</p></div>
                <div><p className="text-xs text-gray-500">Classe de Risco</p><p className="font-semibold">{produto.classe}{produto.subclasse ? ` + ${produto.subclasse}` : ''}</p></div>
                <div><p className="text-xs text-gray-500">Número de Risco</p><p className="font-bold">{produto.numeroRisco}</p></div>
                <div><p className="text-xs text-gray-500">Grupo de Embalagem</p><p className="font-semibold">{produto.grupoEmbalagem || 'N/A'}</p></div>
                <div><p className="text-xs text-gray-500">Estado Físico</p><p className="font-semibold">{produto.estadoFisico === 'L' ? 'Líquido' : produto.estadoFisico === 'S' ? 'Sólido' : 'Gás'}</p></div>
                <div><p className="text-xs text-gray-500">Qtd. Limitada (por emb.)</p><p className="font-semibold">{produto.quantidadeLimitada || '—'}</p></div>
                <div><p className="text-xs text-gray-500">Ficha de Emergência</p><p className="font-semibold">{produto.fichaEmergencia || '—'}</p></div>
                <div><p className="text-xs text-gray-500">Categoria</p><p className="font-semibold">{produto.categoria}</p></div>
                <div><p className="text-xs text-gray-500">MOPP Exigido</p><p className={`font-bold ${produto.mopp ? 'text-red-600' : 'text-green-600'}`}>{produto.mopp ? 'SIM' : 'NÃO'}</p></div>
              </div>
              {produto.observacoes && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                  <Info size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">{produto.observacoes}</p>
                </div>
              )}
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Truck size={18} className="text-blue-500" />
              Requisitos do Veículo e Motorista
            </h3>
            <RequisitosVeiculoSection requisitos={analiseData.requisitosVeiculo} />
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText size={16} className="text-gray-500" />
              Normas e Regulamentos Aplicáveis
            </h3>
            <NormasSection normas={analiseData.normasAplicaveis} />
          </div>
        </>
      )}
    </div>
  )
}
