// ============================================================
// EditPro: Router de Servicios
// ============================================================
// CRUD completo para la tabla de servicios de edición (productos).
// Ejemplos: Edición de Reel, Video YouTube, Spot Publicitario,
// Color Grading, Motion Graphics, etc.
//
// NOTA: No se puede eliminar un servicio si tiene pedidos asociados
// (ON DELETE RESTRICT protege el historial de pedidos).
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../DB/database');

function validarProducto(datos) {
    const errores = [];

    if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim().length < 2) {
        errores.push('El nombre del servicio es obligatorio (mínimo 2 caracteres)');
    }

    if (datos.precio === undefined || datos.precio === null || datos.precio === '') {
        errores.push('El precio del servicio es obligatorio');
    } else {
        const precio = parseFloat(datos.precio);
        if (isNaN(precio) || precio <= 0) {
            errores.push('El precio debe ser un número mayor que 0');
        }
    }

    return errores;
}

// GET /api/productos — Listar todos los servicios
router.get('/', async (req, res) => {
    try {
        const [servicios] = await db.execute(
            'SELECT id, nombre, precio, created_at, updated_at FROM productos ORDER BY id ASC'
        );

        res.json({
            status: 'success',
            data: servicios,
            count: servicios.length
        });

    } catch (error) {
        console.error('Error al listar servicios:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// GET /api/productos/:id — Obtener un servicio
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [servicios] = await db.execute(
            'SELECT id, nombre, precio, created_at, updated_at FROM productos WHERE id = ?',
            [id]
        );

        if (servicios.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Servicio con ID ${id} no encontrado`
            });
        }

        res.json({ status: 'success', data: servicios[0] });

    } catch (error) {
        console.error('Error al obtener servicio:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// POST /api/productos — Crear nuevo servicio
router.post('/', async (req, res) => {
    try {
        const errores = validarProducto(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { nombre, precio } = req.body;

        const [resultado] = await db.execute(
            'INSERT INTO productos (nombre, precio) VALUES (?, ?)',
            [nombre.trim(), parseFloat(precio)]
        );

        const [nuevo] = await db.execute(
            'SELECT id, nombre, precio, created_at FROM productos WHERE id = ?',
            [resultado.insertId]
        );

        res.status(201).json({ status: 'success', data: nuevo[0] });

    } catch (error) {
        console.error('Error al crear servicio:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// PUT /api/productos/:id — Actualizar servicio
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existente] = await db.execute('SELECT id FROM productos WHERE id = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Servicio con ID ${id} no encontrado`
            });
        }

        const errores = validarProducto(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { nombre, precio } = req.body;

        await db.execute(
            'UPDATE productos SET nombre = ?, precio = ? WHERE id = ?',
            [nombre.trim(), parseFloat(precio), id]
        );

        const [actualizado] = await db.execute(
            'SELECT id, nombre, precio, created_at, updated_at FROM productos WHERE id = ?',
            [id]
        );

        res.json({ status: 'success', data: actualizado[0] });

    } catch (error) {
        console.error('Error al actualizar servicio:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// DELETE /api/productos/:id — Eliminar servicio
// No se puede eliminar si tiene pedidos asociados (ON DELETE RESTRICT)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [servicio] = await db.execute(
            'SELECT id, nombre FROM productos WHERE id = ?', [id]
        );

        if (servicio.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Servicio con ID ${id} no encontrado`
            });
        }

        await db.execute('DELETE FROM productos WHERE id = ?', [id]);

        res.json({
            status: 'success',
            data: {
                eliminado: servicio[0],
                mensaje: `Servicio "${servicio[0].nombre}" eliminado correctamente`
            }
        });

    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(409).json({
                status: 'error',
                message: 'No se puede eliminar el servicio porque tiene pedidos asociados'
            });
        }
        console.error('Error al eliminar servicio:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;