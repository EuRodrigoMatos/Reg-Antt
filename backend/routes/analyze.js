const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parseNFe } = require('../services/xmlParser');
const { parsePDF } = require('../services/pdfParser');
const { analisarCarga } = require('../services/rulesEngine');
const db = require('../data/produtos-perigosos.json');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function buscarProdutoPorONU(onu) {
  return db.produtos.find(p => p.onu === onu);
}

function normalizar(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\s]/g, ' ').trim();
}

function matchProduto(nomeProduto, ncm) {
  const termo = normalizar(`${nomeProduto} ${ncm || ''}`);
  const tokens = termo.split(/\s+/).filter(t => t.length > 2);

  let melhor = null;
  let melhorScore = 0;

  for (const p of db.produtos) {
    let score = 0;
    const nomeNorm = normalizar(p.nomeOficial);
    const altsNorm = (p.nomesAlternativos || []).map(normalizar);
    const todosNomes = [nomeNorm, ...altsNorm];

    for (const token of tokens) {
      if (todosNomes.some(n => n.includes(token))) score += 10;
    }

    if (ncm && p.ncm && p.ncm.some(n => n.startsWith(ncm.slice(0, 4)))) {
      score += 25;
    }

    if (score > melhorScore) {
      melhorScore = score;
      melhor = p;
    }
  }

  return melhorScore > 15 ? { produto: melhor, confianca: Math.min(melhorScore, 100) } : null;
}

router.post('/xml', upload.single('arquivo'), async (req, res) => {
  try {
    let xmlContent;
    if (req.file) {
      xmlContent = req.file.buffer.toString('utf-8');
    } else if (req.body.xml) {
      xmlContent = req.body.xml;
    } else {
      return res.status(400).json({ erro: 'Envie o arquivo XML ou o conteúdo XML no campo "xml".' });
    }

    const nfe = await parseNFe(xmlContent);

    const produtosComMatch = nfe.produtos.map(prod => {
      const match = matchProduto(prod.nome, prod.ncm);
      return {
        ...prod,
        produtoPP: match ? match.produto : null,
        confiancaMatch: match ? match.confianca : 0,
        classificado: !!match
      };
    });

    const ppAtivos = produtosComMatch
      .filter(p => p.produtoPP)
      .map(p => ({ produto: p.produtoPP, quantidade: p.quantidade, unidade: p.unidade }));

    const analise = ppAtivos.length > 0 ? analisarCarga(ppAtivos) : null;

    res.json({
      nfe: { ...nfe, produtos: produtosComMatch },
      analise,
      temProdutosPerigosos: ppAtivos.length > 0,
      totalProdutos: nfe.produtos.length,
      produtosPerigososIdentificados: ppAtivos.length
    });
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

router.post('/pdf', upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ erro: 'Envie o arquivo PDF.' });

    const nfe = await parsePDF(req.file.buffer);

    const produtosComMatch = nfe.produtos.map(prod => {
      const match = matchProduto(prod.nome, prod.ncm);
      return {
        ...prod,
        produtoPP: match ? match.produto : null,
        confiancaMatch: match ? match.confianca : 0,
        classificado: !!match
      };
    });

    const ppAtivos = produtosComMatch
      .filter(p => p.produtoPP)
      .map(p => ({ produto: p.produtoPP, quantidade: p.quantidade, unidade: p.unidade }));

    const analise = ppAtivos.length > 0 ? analisarCarga(ppAtivos) : null;

    res.json({
      nfe: { ...nfe, produtos: produtosComMatch },
      analise,
      temProdutosPerigosos: ppAtivos.length > 0,
      totalProdutos: nfe.produtos.length,
      produtosPerigososIdentificados: ppAtivos.length,
      aviso: 'Extração de PDF pode não ser precisa. Verifique os produtos identificados.'
    });
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

router.post('/simular', (req, res) => {
  try {
    const { produtos } = req.body;

    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return res.status(400).json({ erro: 'Informe ao menos um produto com ONU e quantidade.' });
    }

    const produtosComDados = produtos.map(item => {
      const produto = buscarProdutoPorONU(item.onu);
      if (!produto) throw new Error(`ONU ${item.onu} não encontrado na base de dados.`);
      return { produto, quantidade: item.quantidade || 0, unidade: item.unidade || 'UN' };
    });

    const analise = analisarCarga(produtosComDados);
    res.json(analise);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

module.exports = router;
