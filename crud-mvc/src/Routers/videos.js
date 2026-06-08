const express = require('express');
const router  = express.Router();

// GET todos (con nombre de categoría)
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const sql = `
    SELECT v.*, c.nombre AS categoria_nombre
    FROM videos v
    LEFT JOIN categorias c ON v.categoria_id = c.id
    ORDER BY v.id DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET uno
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.query('SELECT * FROM videos WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  });
});

// POST crear
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { titulo, duracion, estado, categoria_id } = req.body;
  if (!titulo) return res.status(400).json({ error: 'El título es obligatorio' });
  db.query(
    'INSERT INTO videos (titulo, duracion, estado, categoria_id) VALUES (?,?,?,?)',
    [titulo, duracion, estado || 'pendiente', categoria_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ mensaje: 'Video creado', id: result.insertId });
    }
  );
});

// PUT actualizar
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { titulo, duracion, estado, categoria_id } = req.body;
  if (!titulo) return res.status(400).json({ error: 'El título es obligatorio' });
  db.query(
    'UPDATE videos SET titulo=?, duracion=?, estado=?, categoria_id=? WHERE id=?',
    [titulo, duracion, estado, categoria_id || null, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!result.affectedRows) return res.status(404).json({ error: 'No encontrado' });
      res.json({ mensaje: 'Video actualizado' });
    }
  );
});

// DELETE eliminar
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.query('DELETE FROM videos WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result.affectedRows) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Video eliminado' });
  });
});

module.exports = router;
