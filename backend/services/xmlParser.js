const xml2js = require('xml2js');

async function parseNFe(xmlContent) {
  const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });

  let result;
  try {
    result = await parser.parseStringPromise(xmlContent);
  } catch (e) {
    throw new Error('XML inválido. Verifique se o arquivo é uma NF-e válida.');
  }

  let infNFe = null;

  if (result.nfeProc) {
    infNFe = result.nfeProc.NFe?.infNFe || result.nfeProc?.NFe?.infNFe;
  } else if (result.NFe) {
    infNFe = result.NFe.infNFe;
  } else if (result['nfeProc:nfeProc']) {
    infNFe = result['nfeProc:nfeProc']['nfe:NFe']?.['nfe:infNFe'];
  }

  const nsKeys = Object.keys(result);
  for (const key of nsKeys) {
    const node = result[key];
    if (node && typeof node === 'object') {
      if (node.NFe?.infNFe) { infNFe = node.NFe.infNFe; break; }
      if (node.infNFe) { infNFe = node.infNFe; break; }
    }
  }

  if (!infNFe) {
    throw new Error('Estrutura da NF-e não reconhecida. Verifique se é um XML de NF-e válido.');
  }

  const emit = infNFe.emit || {};
  const dest = infNFe.dest || {};
  const ide = infNFe.ide || {};

  let dets = infNFe.det;
  if (!dets) throw new Error('Nenhum produto encontrado na NF-e.');
  if (!Array.isArray(dets)) dets = [dets];

  const produtos = dets.map(det => {
    const prod = det.prod || {};
    return {
      item: det.$ ? det.$.nItem : null,
      codigo: prod.cProd || '',
      ean: prod.cEAN || '',
      nome: prod.xProd || '',
      ncm: prod.NCM || '',
      cfop: prod.CFOP || '',
      unidade: prod.uCom || '',
      quantidade: parseFloat(prod.qCom) || 0,
      valorUnitario: parseFloat(prod.vUnCom) || 0,
      valorTotal: parseFloat(prod.vProd) || 0
    };
  });

  return {
    chaveAcesso: infNFe.$ ? infNFe.$.Id?.replace('NFe', '') : '',
    numero: ide.nNF || '',
    serie: ide.serie || '',
    dataEmissao: ide.dhEmi || ide.dEmi || '',
    emitente: {
      nome: emit.xNome || '',
      cnpj: emit.CNPJ || '',
      municipio: emit.enderEmit?.xMun || '',
      uf: emit.enderEmit?.UF || ''
    },
    destinatario: {
      nome: dest.xNome || '',
      cnpj: dest.CNPJ || dest.CPF || '',
      municipio: dest.enderDest?.xMun || '',
      uf: dest.enderDest?.UF || ''
    },
    produtos
  };
}

module.exports = { parseNFe };
