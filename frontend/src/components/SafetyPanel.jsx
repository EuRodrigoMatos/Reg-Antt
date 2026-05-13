export default function SafetyPanel({ painel, tamanho = 'md' }) {
  if (!painel) return null

  const tamanhos = {
    sm: { w: 120, h: 60, fontSize: 14, fontSizeSmall: 10 },
    md: { w: 220, h: 110, fontSize: 28, fontSizeSmall: 16 },
    lg: { w: 300, h: 150, fontSize: 38, fontSizeSmall: 20 }
  }

  const dim = tamanhos[tamanho] || tamanhos.md

  if (painel.tipo === 'NENHUM' || painel.tipo === 'DISPENSADO') {
    return (
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center border-2 border-gray-400 rounded"
          style={{ width: dim.w, height: dim.h, backgroundColor: '#e5e7eb' }}
        >
          <span style={{ fontSize: dim.fontSizeSmall, color: '#6b7280', textAlign: 'center', padding: 8 }}>
            {painel.tipo === 'DISPENSADO' ? 'ISENTO / LQ' : 'SEM PP'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{painel.descricao}</p>
      </div>
    )
  }

  const temRisco = painel.tipo === 'COMPLETO' || painel.tipo === 'RISCO_SEM_ONU'
  const temONU = painel.tipo === 'COMPLETO'

  return (
    <div className="text-center">
      <div className="inline-block" title="Painel de Segurança (ANTT 5998/2022)">
        <svg
          width={dim.w}
          height={dim.h}
          viewBox={`0 0 ${dim.w} ${dim.h}`}
          style={{ display: 'block' }}
        >
          <rect x="2" y="2" width={dim.w - 4} height={dim.h - 4} fill="#FF6B00" stroke="#000" strokeWidth="3" rx="2" />

          <line x1="2" y1={dim.h / 2} x2={dim.w - 2} y2={dim.h / 2} stroke="#000" strokeWidth="2" />

          <text
            x={dim.w / 2}
            y={dim.h / 4 + dim.fontSize / 3}
            textAnchor="middle"
            fontSize={dim.fontSize}
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            fill="#000"
          >
            {temRisco ? painel.numeroRisco : ''}
          </text>

          <text
            x={dim.w / 2}
            y={(3 * dim.h) / 4 + dim.fontSize / 3}
            textAnchor="middle"
            fontSize={dim.fontSize}
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            fill="#000"
          >
            {temONU ? painel.numeroONU : (painel.tipo === 'RISCO_SEM_ONU' ? '----' : '')}
          </text>
        </svg>
      </div>
      <p className="text-xs text-gray-600 mt-2 max-w-xs mx-auto">{painel.descricao}</p>
    </div>
  )
}
