const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

function getDb() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../data/produtos-perigosos.json'), 'utf8'));
}

function normalizar(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .trim();
}

function calcularScore(produto, termoBusca) {
  const termoNorm = normalizar(termoBusca);
  const tokens = termoNorm.split(/\s+/).filter(t => t.length > 2);

  let score = 0;

  if (produto.onu === termoBusca.trim()) return 100;

  const nomeNorm = normalizar(produto.nomeOficial);
  if (nomeNorm === termoNorm) return 95;
  if (nomeNorm.includes(termoNorm)) score += 60;

  for (const alt of produto.nomesAlternativos || []) {
    const altNorm = normalizar(alt);
    if (altNorm === termoNorm) { score = Math.max(score, 90); break; }
    if (altNorm.includes(termoNorm)) { score = Math.max(score, 55); break; }
  }

  const allTokens = nomeNorm.split(/\s+/).concat(
    (produto.nomesAlternativos || []).flatMap(a => normalizar(a).split(/\s+/))
  );

  for (const token of tokens) {
    if (allTokens.some(t => t.includes(token))) score += 10;
  }

  for (const ncm of produto.ncm || []) {
    if (termoBusca.includes(ncm) || ncm.startsWith(termoBusca.replace(/\D/g, '').slice(0, 4))) {
      score += 30;
    }
  }

  return score;
}

router.get('/onu/:numero', (req, res) => {
  const numero = req.params.numero.replace(/\D/g, '');
  const produto = getDb().produtos.find(p => p.onu === numero);
  if (!produto) return res.status(404).json({ erro: `ONU ${numero} não encontrado na base de dados.` });
  res.json(produto);
});

router.get('/nome', (req, res) => {
  const { q, classe, categoria } = req.query;

  if (!q && !classe && !categoria) {
    return res.status(400).json({ erro: 'Informe ao menos um parâmetro de busca: q, classe ou categoria.' });
  }

  let resultados = getDb().produtos;

  if (classe) {
    resultados = resultados.filter(p => p.classe === classe || p.subclasse === classe);
  }
  if (categoria) {
    resultados = resultados.filter(p => p.categoria === categoria.toUpperCase());
  }

  if (q) {
    const comScore = resultados
      .map(p => ({ produto: p, score: calcularScore(p, q) }))
      .filter(r => r.score > 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return res.json(comScore.map(r => ({ ...r.produto, relevancia: r.score })));
  }

  res.json(resultados.slice(0, 20));
});

router.get('/classes', (req, res) => {
  const { produtos } = getDb();
  const classes = [...new Set(produtos.map(p => p.classe))].sort();
  const categorias = [...new Set(produtos.map(p => p.categoria))].sort();
  res.json({ classes, categorias });
});

router.post('/match-nfe', (req, res) => {
  const { produtos } = req.body;
  if (!produtos || !Array.isArray(produtos)) {
    return res.status(400).json({ erro: 'Informe uma lista de produtos.' });
  }

  const resultados = produtos.map(prod => {
    const termo = `${prod.nome} ${prod.ncm || ''}`.trim();
    const candidatos = getDb().produtos
      .map(p => ({ produto: p, score: calcularScore(p, termo) }))
      .filter(r => r.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      produtoNFe: prod,
      matches: candidatos.map(c => ({ ...c.produto, relevancia: c.score })),
      encontrado: candidatos.length > 0,
      sugerido: candidatos.length > 0 ? candidatos[0].produto : null
    };
  });

  res.json(resultados);
});

module.exports = router;
