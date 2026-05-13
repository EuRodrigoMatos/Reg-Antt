const db = require('../data/produtos-perigosos.json');

function determinarPainel(produtos) {
  if (!produtos || produtos.length === 0) {
    return { tipo: 'NENHUM', numeroRisco: null, numeroONU: null, descricao: 'Nenhum produto perigoso identificado.' };
  }

  const ativos = produtos.filter(p => !p.dispensado);

  if (ativos.length === 0) {
    return { tipo: 'DISPENSADO', numeroRisco: null, numeroONU: null, descricao: 'Todos os produtos estão em quantidade limitada. Painel não obrigatório, mas recomendado o rótulo LQ.' };
  }

  if (ativos.length === 1) {
    return {
      tipo: 'COMPLETO',
      numeroRisco: ativos[0].numeroRisco,
      numeroONU: ativos[0].onu,
      descricao: `Painel completo: Número de Risco ${ativos[0].numeroRisco} / ONU ${ativos[0].onu}`
    };
  }

  const onusUnicos = [...new Set(ativos.map(p => p.onu))];
  if (onusUnicos.length === 1) {
    return {
      tipo: 'COMPLETO',
      numeroRisco: ativos[0].numeroRisco,
      numeroONU: ativos[0].onu,
      descricao: `Todos os produtos possuem o mesmo ONU. Painel completo: ${ativos[0].numeroRisco} / ${ativos[0].onu}`
    };
  }

  const numerosRiscoUnicos = [...new Set(ativos.map(p => p.numeroRisco))];
  if (numerosRiscoUnicos.length === 1) {
    return {
      tipo: 'RISCO_SEM_ONU',
      numeroRisco: numerosRiscoUnicos[0],
      numeroONU: null,
      descricao: `Múltiplos ONU com mesmo número de risco (${numerosRiscoUnicos[0]}). Painel exibe número de risco, ONU em branco.`
    };
  }

  return {
    tipo: 'LARANJA_VAZIO',
    numeroRisco: null,
    numeroONU: null,
    descricao: 'Múltiplos produtos com números de risco diferentes. Painel laranja SEM numeração.'
  };
}

function verificarCompatibilidade(produtos) {
  if (!produtos || produtos.length <= 1) {
    return { compativel: true, conflitos: [], aviso: null };
  }

  const regras = db.compatibilidade.regras;
  const conflitos = [];

  for (let i = 0; i < produtos.length; i++) {
    for (let j = i + 1; j < produtos.length; j++) {
      const classeA = produtos[i].classe;
      const classeB = produtos[j].classe;

      if (regras[classeA] && regras[classeA][classeB] === false) {
        conflitos.push({
          produtoA: { nome: produtos[i].nomeOficial, onu: produtos[i].onu, classe: classeA },
          produtoB: { nome: produtos[j].nomeOficial, onu: produtos[j].onu, classe: classeB },
          motivo: `Classe ${classeA} é incompatível com Classe ${classeB} conforme ANTT 5998/2022`
        });
      }
    }
  }

  return {
    compativel: conflitos.length === 0,
    conflitos,
    aviso: conflitos.length > 0
      ? `ATENÇÃO: ${conflitos.length} incompatibilidade(s) detectada(s). Estes produtos NÃO podem ser transportados juntos no mesmo veículo.`
      : null
  };
}

function calcularRotulos(produtos) {
  const rotulos = new Set();
  const rotulosSubsidiarios = new Set();

  for (const p of produtos) {
    for (const r of p.rotulos) rotulos.add(r);
    for (const r of p.rotulosSubsidiarios) rotulosSubsidiarios.add(r);
  }

  return {
    principais: [...rotulos],
    subsidiarios: [...rotulosSubsidiarios]
  };
}

function calcularRequisitosVeiculo(produtos) {
  const requisitos = [];
  const temPP = produtos.some(p => p.mopp);
  const classes = [...new Set(produtos.map(p => p.classe))];

  if (temPP) {
    requisitos.push({
      tipo: 'MOPP',
      descricao: 'Motorista deve possuir Curso MOPP (Movimentação Operacional de Produtos Perigosos) válido',
      obrigatorio: true
    });
  }

  requisitos.push({
    tipo: 'RNTRC',
    descricao: 'Transportador deve estar registrado no RNTRC (Registro Nacional de Transportadores Rodoviários de Cargas)',
    obrigatorio: true
  });

  requisitos.push({
    tipo: 'KIT_EMERGENCIA',
    descricao: 'Veículo deve portar Kit de Emergência conforme ABNT NBR 9735',
    obrigatorio: true
  });

  requisitos.push({
    tipo: 'FICHA_EMERGENCIA',
    descricao: 'Ficha de Emergência e Envelope de Transporte conforme ABNT NBR 7503',
    obrigatorio: true
  });

  requisitos.push({
    tipo: 'EXTINTOR',
    descricao: 'Extintor de incêndio adequado ao tipo de produto (verificar especificação conforme ANTT 5998/2022)',
    obrigatorio: true
  });

  if (classes.includes('3') || classes.includes('4.1') || classes.includes('2.1')) {
    requisitos.push({
      tipo: 'CABINE_VEDADA',
      descricao: 'Cabine deve ser estanque (vedada) para produtos inflamáveis',
      obrigatorio: true
    });
  }

  if (classes.includes('2') || classes.includes('2.1') || classes.includes('2.2') || classes.includes('2.3')) {
    requisitos.push({
      tipo: 'TANQUE_ESPECIAL',
      descricao: 'Transporte de gases requer veículo-tanque homologado ou cilindros certificados',
      obrigatorio: true
    });
  }

  return requisitos;
}

function verificarDispensas(produto, quantidadeTotal) {
  if (!produto.quantidadeLimitada || produto.quantidadeLimitada === '0' || produto.quantidadeLimitada === 'N/A') {
    return { dispensado: false, motivo: 'Produto não possui quantidade limitada definida' };
  }

  if (produto.regraEspecial === 'ONU3077' || produto.regraEspecial === 'ONU3082') {
    return {
      dispensado: false,
      aviso: `ONU ${produto.onu}: Isento de painel se ≤ 5 ${produto.estadoFisico === 'S' ? 'kg' : 'L'} por embalagem e ≤ 15 ${produto.estadoFisico === 'S' ? 'kg' : 'L'} no total. Verificar quantidade real.`
    };
  }

  return { dispensado: false, aviso: `Quantidade limitada: ${produto.quantidadeLimitada} por embalagem interna` };
}

function analisarCarga(produtosComQuantidade) {
  const resultados = produtosComQuantidade.map(item => {
    const produto = item.produto;
    const dispensa = verificarDispensas(produto, item.quantidade);
    return {
      ...produto,
      quantidadeTransportada: item.quantidade,
      unidade: item.unidade,
      dispensado: dispensa.dispensado,
      avisoDispensa: dispensa.aviso
    };
  });

  const painel = determinarPainel(resultados);
  const compatibilidade = verificarCompatibilidade(resultados.map(r => r));
  const rotulos = calcularRotulos(resultados);
  const requisitosVeiculo = calcularRequisitosVeiculo(resultados);

  return {
    produtos: resultados,
    painel,
    compatibilidade,
    rotulos,
    requisitosVeiculo,
    regulamento: 'ANTT 5998/2022',
    normasAplicaveis: [
      'Resolução ANTT nº 5.998/2022',
      'ABNT NBR 7500 - Identificação para transporte terrestre',
      'ABNT NBR 7503 - Ficha de emergência e envelope',
      'ABNT NBR 9735 - Kit de emergência',
      'Lista ONU de Produtos Perigosos (Orange Book)'
    ]
  };
}

module.exports = { analisarCarga, determinarPainel, verificarCompatibilidade, calcularRotulos };
