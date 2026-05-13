const CLASSES = {
  '1':   { bg: '#FF8C00', text: '#000', label: 'EXPLOSIVO', simbolo: '💥', descricao: 'Classe 1 - Explosivos' },
  '1.1': { bg: '#FF8C00', text: '#000', label: 'EXPLOSIVO', simbolo: '💥', descricao: 'Classe 1.1 - Explosivos de grande risco' },
  '2.1': { bg: '#FF0000', text: '#FFF', label: 'INFLAMÁVEL', simbolo: '🔥', descricao: 'Classe 2.1 - Gás Inflamável' },
  '2.2': { bg: '#007030', text: '#FFF', label: 'NÃO INFLAMÁVEL', simbolo: '⚗️', descricao: 'Classe 2.2 - Gás Não Inflamável' },
  '2.3': { bg: '#FFFFFF', text: '#000', label: 'TÓXICO', simbolo: '☠️', descricao: 'Classe 2.3 - Gás Tóxico', border: '#000' },
  '3':   { bg: '#FF0000', text: '#FFF', label: 'INFLAMÁVEL', simbolo: '🔥', descricao: 'Classe 3 - Líquido Inflamável' },
  '4.1': { bg: '#FF0000', text: '#FFF', label: 'INFLAMÁVEL', simbolo: '🔥', descricao: 'Classe 4.1 - Sólido Inflamável', striped: true },
  '4.2': { bg: '#FF0000', text: '#FFF', label: 'INFLAMÁVEL', simbolo: '🔥', descricao: 'Classe 4.2 - Combustão Espontânea', halfWhite: true },
  '4.3': { bg: '#0055A4', text: '#FFF', label: 'REAGE C/ ÁGUA', simbolo: '💧', descricao: 'Classe 4.3 - Reage com Água' },
  '5.1': { bg: '#FFFF00', text: '#000', label: 'OXIDANTE', simbolo: '⭕', descricao: 'Classe 5.1 - Substância Oxidante' },
  '5.2': { bg: '#FF0000', text: '#FFF', label: 'PERÓXIDO', simbolo: '⭕', descricao: 'Classe 5.2 - Peróxido Orgânico', halfYellow: true },
  '6.1': { bg: '#FFFFFF', text: '#000', label: 'TÓXICO', simbolo: '☠️', descricao: 'Classe 6.1 - Substância Tóxica', border: '#000' },
  '6.2': { bg: '#FFFFFF', text: '#000', label: 'INFECCIOSO', simbolo: '☣️', descricao: 'Classe 6.2 - Substância Infecciosa', border: '#000' },
  '7':   { bg: '#FFFF00', text: '#000', label: 'RADIOATIVO', simbolo: '☢️', descricao: 'Classe 7 - Material Radioativo' },
  '8':   { bg: '#000000', text: '#FFF', label: 'CORROSIVO', simbolo: '🧪', descricao: 'Classe 8 - Substância Corrosiva', halfWhite: true },
  '9':   { bg: '#FFFFFF', text: '#000', label: 'PERIGOSO', simbolo: '⚠️', descricao: 'Classe 9 - Substâncias Perigosas Diversas', striped: true, border: '#000' }
}

export default function RiskLabel({ classe, size = 80, subsidiario = false }) {
  const config = CLASSES[classe] || CLASSES['9']
  const border = config.border || config.bg

  return (
    <div
      className="inline-flex flex-col items-center"
      title={config.descricao}
    >
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: config.bg,
          border: `3px solid ${subsidiario ? '#666' : border}`,
          transform: 'rotate(45deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0
        }}
      >
        <div
          style={{
            transform: 'rotate(-45deg)',
            textAlign: 'center',
            lineHeight: 1
          }}
        >
          <div style={{ fontSize: size * 0.32 }}>{config.simbolo}</div>
          <div style={{
            fontSize: size * 0.12,
            fontWeight: 'bold',
            color: config.text,
            fontFamily: 'Arial, sans-serif',
            marginTop: 2
          }}>
            {classe}
          </div>
        </div>
      </div>
      <p
        style={{ fontSize: Math.max(9, size * 0.13) }}
        className="font-bold text-center mt-3 text-gray-700 uppercase tracking-wide"
      >
        {subsidiario ? '(Subsidiário)' : config.label}
      </p>
      <p style={{ fontSize: Math.max(8, size * 0.1) }} className="text-gray-500 text-center">
        {config.descricao}
      </p>
    </div>
  )
}
