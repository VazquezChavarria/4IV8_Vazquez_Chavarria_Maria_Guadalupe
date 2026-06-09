// ============================================================
// EditPro: Router de Pedidos
// ============================================================
// Gestiona los pedidos de edición de video.
// Relaciona clientes con servicios contratados.
//
// ENDPOINTS:
// GET    /api/compras                    → Listar todos los pedidos
// GET    /api/compras/:id                → Obtener un pedido
// GET    /api/compras/usuario/:id        → Pedidos de un cliente
// POST   /api/compras                    → Registrar nuevo pedido
// DELETE /api/compras/:id                → Cancelar un pedido
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../DB/database');

function validarCompra(datos) {
    const errores = [];

    if (!datos.usuario_id) {
        errores.push('El ID del cliente es obligatorio');
    } else if (!Number.isInteger(Number(datos.usuario_id)) || Number(datos.usuario_id) <= 0) {
        errores.push('El ID del cliente debe ser un número entero positivo');
    }

    if (!datos.producto_id) {
        errores.push('El ID del servicio es obligatorio');
    } else if (!Number.isInteger(Number(datos.producto_id)) || Number(datos.producto_id) <= 0) {
        errores.push('El ID del servicio debe ser un número entero positivo');
    }

    if (datos.cantidad !== undefined) {
        const cant = Number(datos.cantidad);
        if (!Number.isInteger(cant) || cant <= 0) {
            errores.push('La cantidad de videos debe ser un número entero mayor que 0');
        }
    }

    return errores;
}

// GET /api/compras — Listar todos los pedidos
router.get('/', async (req, res) => {
    try {
        const [pedidos] = await db.execute(`
            SELECT
                c.id,
                c.usuario_id,
                u.nombre AS usuario_nombre,
                u.email AS usuario_email,
                c.producto_id,
                p.nombre AS producto_nombre,
                p.precio AS producto_precio,
                c.cantidad,
                (p.precio * c.cantidad) AS total,
                c.fecha_compra
            FROM compras c
            INNER JOIN usuarios u ON c.usuario_id = u.id
            INNER JOIN productos p ON c.producto_id = p.id
            ORDER BY c.fecha_compra DESC
        `);

        res.json({
            status: 'success',
            data: pedidos,
            count: pedidos.length
        });

    } catch (error) {
        console.error('Error al listar pedidos:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// GET /api/compras/:id — Obtener un pedido por ID
router.get('/:id', async (req, res) => {
    try {
        if (req.params.id === 'usuario') {
            return res.status(400).json({
                status: 'error',
                message: 'Usa /api/compras/usuario/:cliente_id para buscar por cliente'
            });
        }

        const { id } = req.params;

        const [pedidos] = await db.execute(`
            SELECT
                c.id,
                c.usuario_id,
                u.nombre AS usuario_nombre,
                c.producto_id,
                p.nombre AS producto_nombre,
                p.precio AS producto_precio,
                c.cantidad,
                (p.precio * c.cantidad) AS total,
                c.fecha_compra
            FROM compras c
            INNER JOIN usuarios u ON c.usuario_id = u.id
            INNER JOIN productos p ON c.producto_id = p.id
            WHERE c.id = ?
        `, [id]);

        if (pedidos.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Pedido con ID ${id} no encontrado`
            });
        }

        res.json({ status: 'success', data: pedidos[0] });

    } catch (error) {
        console.error('Error al obtener pedido:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// GET /api/compras/usuario/:usuario_id — Pedidos de un cliente
router.get('/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const [cliente] = await db.execute(
            'SELECT id, nombre, email FROM usuarios WHERE id = ?',
            [usuario_id]
        );

        if (cliente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Cliente con ID ${usuario_id} no encontrado`
            });
        }

        const [pedidos] = await db.execute(`
            SELECT
                c.id,
                p.nombre AS producto,
                p.precio,
                c.cantidad,
                (p.precio * c.cantidad) AS total,
                c.fecha_compra
            FROM compras c
            INNER JOIN productos p ON c.producto_id = p.id
            WHERE c.usuario_id = ?
            ORDER BY c.fecha_compra DESC
        `, [usuario_id]);

        const totalGastado = pedidos.reduce((sum, c) => sum + parseFloat(c.total), 0);

        res.json({
            status: 'success',
            data: {
                usuario: cliente[0],
                compras: pedidos,
                total_compras: pedidos.length,
                total_gastado: totalGastado.toFixed(2)
            }
        });

    } catch (error) {
        console.error('Error al obtener pedidos del cliente:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// POST /api/compras — Registrar nuevo pedido
router.post('/', async (req, res) => {
    try {
        const errores = validarCompra(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { usuario_id, producto_id, cantidad = 1 } = req.body;

        const [cliente] = await db.execute(
            'SELECT id, nombre FROM usuarios WHERE id = ?', [usuario_id]
        );
        if (cliente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Cliente con ID ${usuario_id} no encontrado`
            });
        }

        const [servicio] = await db.execute(
            'SELECT id, nombre, precio FROM productos WHERE id = ?', [producto_id]
        );
        if (servicio.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Servicio con ID ${producto_id} no encontrado`
            });
        }

        const [resultado] = await db.execute(
            'INSERT INTO compras (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
            [usuario_id, producto_id, parseInt(cantidad)]
        );

        const total = (servicio[0].precio * parseInt(cantidad)).toFixed(2);

        res.status(201).json({
            status: 'success',
            data: {
                id: resultado.insertId,
                usuario: cliente[0].nombre,
                producto: servicio[0].nombre,
                precio_unitario: servicio[0].precio,
                cantidad: parseInt(cantidad),
                total: parseFloat(total)
            }
        });

    } catch (error) {
        console.error('Error al registrar pedido:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// DELETE /api/compras/:id — Cancelar un pedido
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [pedido] = await db.execute(
            'SELECT id FROM compras WHERE id = ?', [id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Pedido con ID ${id} no encontrado`
            });
        }

        await db.execute('DELETE FROM compras WHERE id = ?', [id]);

        res.json({
            status: 'success',
            data: { mensaje: `Pedido con ID ${id} cancelado correctamente` }
        });

    } catch (error) {
        console.error('Error al cancelar pedido:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;