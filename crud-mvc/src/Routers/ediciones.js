const express = require('express');
const router  = express.Router();

// GET todas (con título del video)
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const sql = `
    SELECT e.*, v.titulo AS video_titulo
    FROM ediciones e
    LEFT JOIN videos v ON e.video_id = v.id
    ORDER BY e.fecha DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET una
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.query('SELECT * FROM ediciones WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  });
});

// POST crear
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { video_id, editor, notas } = req.body;
  if (!video_id || !editor) return res.status(400).json({ error: 'Video y editor son obligatorios' });
  db.query(
    'INSERT INTO ediciones (video_id, editor, notas) VALUES (?,?,?)',
    [video_id, editor, notas],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ mensaje: 'Edición registrada', id: result.insertId });
    }
  );
});

// PUT actualizar
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { video_id, editor, notas } = req.body;
  if (!video_id || !editor) return res.status(400).json({ error: 'Video y editor son obligatorios' });
  db.query(
    'UPDATE ediciones SET video_id=?, editor=?, notas=? WHERE id=?',
    [video_id, editor, notas, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!result.affectedRows) return res.status(404).json({ error: 'No encontrado' });
      res.json({ mensaje: 'Edición actualizada' });
    }
  );
});

// DELETE eliminar
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.query('DELETE FROM ediciones WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result.affectedRows) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Edición eliminada' });
  });
});

module.exports = router;
