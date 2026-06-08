const express = require('express');
const cors    = require('cors');
const path    = require('path');
const mysql   = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ── CONEXIÓN ──────────────────────────────────────────────
// Cambia la contraseña por la tuya
const db = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: 'Lupita.14',
  database: 'videos_db'
});

db.connect(err => {
  if (err) { console.error('❌ Error MySQL:', err.message); process.exit(1); }
  console.log('✅ Conectado a MySQL');
});

// Exportar db para usarlo en los routers
app.locals.db = db;

// ── ROUTERS ───────────────────────────────────────────────
const routerCategorias = require('./Routers/categorias');
const routerVideos     = require('./Routers/videos');
const routerEdiciones  = require('./Routers/ediciones');

app.use('/api/categorias', routerCategorias);
app.use('/api/videos',     routerVideos);
app.use('/api/ediciones',  routerEdiciones);

// ── INICIO ────────────────────────────────────────────────
app.listen(3000, () => {
  console.log('🚀 Servidor en http://localhost:3000');
});
