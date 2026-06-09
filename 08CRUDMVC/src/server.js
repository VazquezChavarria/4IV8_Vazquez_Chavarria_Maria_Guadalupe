const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, '..', 'public')));

const clientesRouter = require('./Routers/usuarios');
const serviciosRouter = require('./Routers/productos');
const pedidosRouter = require('./Routers/compras');

app.use('/api/usuarios', clientesRouter);
app.use('/api/productos', serviciosRouter);
app.use('/api/compras', pedidosRouter);

app.get('/api', (req, res) => {
    res.json({
        status: 'success',
        message: 'EditPro API REST — Servicio de Edición de Videos',
        endpoint: {
            clientes: {
                listar:     'GET /api/usuarios',
                obtener:    'GET /api/usuarios/:id',
                crear:      'POST /api/usuarios',
                actualizar: 'PUT /api/usuarios/:id',
                eliminar:   'DELETE /api/usuarios/:id'
            },
            servicios: {
                listar:     'GET /api/productos',
                obtener:    'GET /api/productos/:id',
                crear:      'POST /api/productos',
                actualizar: 'PUT /api/productos/:id',
                eliminar:   'DELETE /api/productos/:id'
            },
            pedidos: {
                listar:     'GET /api/compras',
                obtener:    'GET /api/compras/:id',
                porCliente: 'GET /api/compras/usuario/:id',
                crear:      'POST /api/compras',
                eliminar:   'DELETE /api/compras/:id'
            }
        }
    });
});

app.use('/api/*path', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada'
    });
});

app.use((err, req, res, next) => {
    console.log('Error no manejado: ', err.message);
    res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
    });
});

app.listen(PORT, () => {
    console.log(`EditPro server iniciado en el puerto ${PORT}`);
});
