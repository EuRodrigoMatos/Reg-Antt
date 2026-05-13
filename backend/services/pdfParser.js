const pdfParse = require('pdf-parse');

async function parsePDF(buffer) {
  let data;
  try {
    data = await pdfParse(buffer);
  } catch (e) {
    throw new Error('Erro ao ler o PDF. Certifique-se de que o arquivo não está corrompido.');
  }

  const text = data.text;
  const linhas = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const nfe = extrairDadosNFe(text, linhas);
  const produtos = extrairProdutos(text, linhas);

  return { ...nfe, produtos, textoCompleto: text };
}

function extrairDadosNFe(text, linhas) {
  const chaveMatch = text.match(/\b(\d{44})\b/);
  const chaveAcesso = chaveMatch ? chaveMatch[1] : '';

  const nfMatch = text.match(/N[ºo°\.]?\s*(?:NF|Nota Fiscal)[:\s]*(\d+)/i) ||
    text.match(/(?:NÚMERO|NUMERO)[:\s]*(\d+)/i);

  const dataMatch = text.match(/(?:EMISSÃO|EMISSAO|Data)[:\s]*(\d{2}\/\d{2}\/\d{4})/i);

  const emitMatch = text.match(/(?:EMITENTE|REMETENTE|CNPJ)[:\s]*([^\n]{3,60})/i);

  return {
    chaveAcesso,
    numero: nfMatch ? nfMatch[1] : '',
    dataEmissao: dataMatch ? dataMatch[1] : '',
    emitente: { nome: emitMatch ? emitMatch[1].trim() : '' },
    destinatario: { nome: '' }
  };
}

function extrairProdutos(text, linhas) {
  const produtos = [];

  const padroesProduto = [
    /^\d+\s+(.+?)\s+([A-Z]{1,4})\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)/,
    /^(\d+)\s*[-–]\s*(.+?)\s+([\d.,]+)\s+([A-Z]{1,4})/
  ];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    for (const padrao of padroesProduto) {
      const match = linha.match(padrao);
      if (match) {
        const nome = (match[2] || match[1] || '').trim();
        if (nome.length > 3 && !nome.match(/^(TOTAL|SUBTOTAL|FRETE|SEGURO|DESCONTO|OUTROS)/i)) {
          produtos.push({
            item: produtos.length + 1,
            codigo: '',
            nome,
            ncm: extrairNCM(linhas, i),
            unidade: match[3] || '',
            quantidade: parseFloat((match[3] || '0').replace(',', '.')) || 0,
            valorTotal: parseFloat((match[5] || '0').replace(',', '.').replace(/\./g, '').replace(',', '.')) || 0
          });
        }
        break;
      }
    }
  }

  if (produtos.length === 0) {
    return extrairProdutosFallback(linhas);
  }

  return produtos;
}

function extrairNCM(linhas, indiceAtual) {
  for (let offset = -2; offset <= 2; offset++) {
    const linha = linhas[indiceAtual + offset] || '';
    const ncmMatch = linha.match(/\b(\d{8})\b/);
    if (ncmMatch) return ncmMatch[1];
  }
  return '';
}

function extrairProdutosFallback(linhas) {
  const produtos = [];
  const ncmRegex = /\b(\d{8})\b/;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (ncmRegex.test(linha)) {
      const ncm = linha.match(ncmRegex)[1];
      const nomeLinha = linhas[i - 1] || linhas[i];
      if (nomeLinha && nomeLinha.length > 3) {
        produtos.push({
          item: produtos.length + 1,
          codigo: '',
          nome: nomeLinha.trim(),
          ncm,
          unidade: '',
          quantidade: 0,
          valorTotal: 0
        });
      }
    }
  }

  return produtos;
}

module.exports = { parsePDF };
