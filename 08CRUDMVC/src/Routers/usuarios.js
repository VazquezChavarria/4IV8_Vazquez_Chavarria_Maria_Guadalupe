// ============================================================
// EditPro: Router de Clientes
// ============================================================
// CRUD completo para la tabla de clientes (usuarios).
// Gestiona el registro de personas que contratan servicios
// de edición de video.
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../DB/database');

function validarUsuario(datos) {
    const errores = [];

    if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim().length < 2) {
        errores.push('El nombre del cliente es obligatorio (mínimo 2 caracteres)');
    }

    if (!datos.email || typeof datos.email !== 'string') {
        errores.push('El correo de contacto es obligatorio');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datos.email)) {
            errores.push('El formato del correo no es válido');
        }
    }

    return errores;
}

// GET /api/usuarios — Listar todos los clientes
router.get('/', async (req, res) => {
    try {
        const [clientes] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios ORDER BY id ASC'
        );

        res.json({
            status: 'success',
            data: clientes,
            count: clientes.length
        });

    } catch (error) {
        console.error('Error al listar clientes:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// GET /api/usuarios/:id — Obtener un cliente por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [clientes] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios WHERE id = ?',
            [id]
        );

        if (clientes.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Cliente con ID ${id} no encontrado`
            });
        }

        res.json({ status: 'success', data: clientes[0] });

    } catch (error) {
        console.error('Error al obtener cliente:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// POST /api/usuarios — Registrar nuevo cliente
router.post('/', async (req, res) => {
    try {
        const errores = validarUsuario(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { nombre, email } = req.body;

        const [resultado] = await db.execute(
            'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
            [nombre.trim(), email.trim().toLowerCase()]
        );

        const [nuevoCliente] = await db.execute(
            'SELECT id, nombre, email, created_at FROM usuarios WHERE id = ?',
            [resultado.insertId]
        );

        res.status(201).json({ status: 'success', data: nuevoCliente[0] });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un cliente registrado con ese correo'
            });
        }
        console.error('Error al registrar cliente:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// PUT /api/usuarios/:id — Actualizar cliente
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existente] = await db.execute('SELECT id FROM usuarios WHERE id = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Cliente con ID ${id} no encontrado`
            });
        }

        const errores = validarUsuario(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { nombre, email } = req.body;

        await db.execute(
            'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
            [nombre.trim(), email.trim().toLowerCase(), id]
        );

        const [actualizado] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios WHERE id = ?',
            [id]
        );

        res.json({ status: 'success', data: actualizado[0] });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe otro cliente con ese correo'
            });
        }
        console.error('Error al actualizar cliente:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// DELETE /api/usuarios/:id — Eliminar cliente
// Al eliminar un cliente se eliminan automáticamente sus pedidos (ON DELETE CASCADE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [cliente] = await db.execute(
            'SELECT id, nombre FROM usuarios WHERE id = ?', [id]
        );

        if (cliente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Cliente con ID ${id} no encontrado`
            });
        }

        await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);

        res.json({
            status: 'success',
            data: {
                eliminado: cliente[0],
                mensaje: `Cliente "${cliente[0].nombre}" y sus pedidos han sido eliminados`
            }
        });

    } catch (error) {
        console.error('Error al eliminar cliente:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;