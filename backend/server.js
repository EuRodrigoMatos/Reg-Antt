const express = require('express');
const cors = require('cors');
const path = require('path');

const searchRoutes = require('./routes/search');
const analyzeRoutes = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/search', searchRoutes);
app.use('/api/analyze', analyzeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', versao: '1.0.0', regulamento: 'ANTT 5998/2022' });
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Sistema ANTT - Produtos Perigosos`);
  console.log(`  Servidor rodando na porta ${PORT}`);
  console.log(`  Regulamento: ANTT 5998/2022`);
  console.log(`========================================\n`);
});
