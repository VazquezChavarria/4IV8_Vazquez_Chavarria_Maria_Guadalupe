const express = require('express');
const router  = express.Router();

// GET todas
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  db.query('SELECT * FROM categorias ORDER BY nombre', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET una
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.query('SELECT * FROM categorias WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  });
});

// POST crear
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  db.query('INSERT INTO categorias (nombre, descripcion) VALUES (?,?)', [nombre, descripcion], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ mensaje: 'Categoría creada', id: result.insertId });
  });
});

// PUT actualizar
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  db.query('UPDATE categorias SET nombre=?, descripcion=? WHERE id=?', [nombre, descripcion, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result.affectedRows) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Categoría actualizada' });
  });
});

// DELETE eliminar
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.query('DELETE FROM categorias WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result.affectedRows) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Categoría eliminada' });
  });
});

module.exports = router;
