// ============================================================
// PRÁCTICA 3 - PNT: Frontend para Sistema de Compras
// ============================================================
// Este frontend maneja 3 secciones: Usuarios, Productos, Compras.
// Cada sección tiene su propio formulario y tabla.
//
// ESTRUCTURA DEL CÓDIGO:
// 1. Utilidades compartidas (fetchAPI, notificaciones, etc.)
// 2. Módulo de Usuarios (CRUD)
// 3. Módulo de Productos (CRUD)
// 4. Módulo de Compras (crear, listar, eliminar)
// 5. Navegación por pestañas
// 6. Inicialización
//
// EVOLUCIÓN DESDE P2:
// - Múltiples recursos (no solo usuarios)
// - Selects dinámicos (llenar opciones desde la API)
// - Navegación por pestañas sin recargar página (SPA-like)
// ============================================================

// ============================================================
// 1. UTILIDADES COMPARTIDAS
// ============================================================

// Panel de estado de la API
const apiMetodo = document.getElementById('api-metodo');
const apiUrl = document.getElementById('api-url');
const apiCodigo = document.getElementById('api-codigo');
const notificacionDiv = document.getElementById('notificacion');

// Fetch wrapper con logging (evolución de P2)
async function fetchAPI(url, opciones = {}) {
    const method = opciones.method || 'GET';

    apiMetodo.textContent = method;
    apiMetodo.className = `badge badge-${method.toLowerCase()}`;
    apiUrl.textContent = url;
    apiCodigo.textContent = '...';
    apiCodigo.className = 'badge badge-neutral';

    try {
        const respuesta = await fetch(url, opciones);
        apiCodigo.textContent = `${respuesta.status}`;
        apiCodigo.className = `badge ${respuesta.ok ? 'badge-success' : 'badge-error'}`;

        const datos = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(datos.message || `Error ${respuesta.status}`);
        }
        return datos;
    } catch (error) {
        if (apiCodigo.textContent === '...') {
            apiCodigo.textContent = 'ERROR';
            apiCodigo.className = 'badge badge-error';
        }
        throw error;
    }
}

function mostrarNotificacion(mensaje, tipo) {
    notificacionDiv.textContent = mensaje;
    notificacionDiv.className = `notificacion ${tipo}`;
    notificacionDiv.style.display = 'block';
    setTimeout(() => { notificacionDiv.style.display = 'none'; }, 3000);
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function formatearFechaHora(fechaISO) {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// ============================================================
// 2. MÓDULO DE USUARIOS
// ============================================================
const formUsuario = document.getElementById('form-usuario');
const inputUsuarioId = document.getElementById('usuario-id');
const inputUsuarioNombre = document.getElementById('usuario-nombre');
const inputUsuarioEmail = document.getElementById('usuario-email');
const formTituloUsuario = document.getElementById('form-titulo-usuario');
const btnGuardarUsuario = document.getElementById('btn-guardar-usuario');
const btnCancelarUsuario = document.getElementById('btn-cancelar-usuario');
const tbodyUsuarios = document.getElementById('tbody-usuarios');
const tablaUsuarios = document.getElementById('tabla-usuarios');
const cargaUsuarios = document.getElementById('carga-usuarios');
const contadorUsuarios = document.getElementById('contador-usuarios');
const errorUsuarioNombre = document.getElementById('error-usuario-nombre');
const errorUsuarioEmail = document.getElementById('error-usuario-email');

async function cargarUsuarios() {
    try {
        const resp = await fetchAPI('/api/usuarios');
        cargaUsuarios.style.display = 'none';

        if (resp.data.length === 0) {
            tablaUsuarios.style.display = 'none';
            cargaUsuarios.textContent = 'No hay usuarios registrados.';
            cargaUsuarios.style.display = 'block';
        } else {
            tablaUsuarios.style.display = 'table';
            tbodyUsuarios.innerHTML = '';
            resp.data.forEach(u => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${u.id}</td>
                    <td>${escapeHtml(u.nombre)}</td>
                    <td>${escapeHtml(u.email)}</td>
                    <td>
                        <button class="btn-ver" onclick="verComprasUsuario(${u.id})">Compras</button>
                        <button class="btn-editar" onclick="editarUsuario(${u.id})">Editar</button>
                        <button class="btn-eliminar" onclick="confirmarEliminarUsuario(${u.id}, '${escapeHtml(u.nombre)}')">Eliminar</button>
                    </td>
                `;
                tbodyUsuarios.appendChild(fila);
            });
        }
        contadorUsuarios.textContent = `${resp.count}`;
    } catch (error) {
        mostrarNotificacion('Error al cargar usuarios: ' + error.message, 'error');
    }
}

function validarFormUsuario() {
    let ok = true;
    const nombre = inputUsuarioNombre.value.trim();
    const email = inputUsuarioEmail.value.trim();

    if (!nombre || nombre.length < 2) {
        errorUsuarioNombre.textContent = 'Mínimo 2 caracteres';
        inputUsuarioNombre.classList.add('input-error');
        ok = false;
    } else {
        errorUsuarioNombre.textContent = '';
        inputUsuarioNombre.classList.remove('input-error');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorUsuarioEmail.textContent = 'Email no válido';
        inputUsuarioEmail.classList.add('input-error');
        ok = false;
    } else {
        errorUsuarioEmail.textContent = '';
        inputUsuarioEmail.classList.remove('input-error');
    }

    return ok;
}

function limpiarFormUsuario() {
    formUsuario.reset();
    inputUsuarioId.value = '';
    formTituloUsuario.textContent = 'Agregar Usuario';
    btnGuardarUsuario.textContent = 'Guardar';
    btnCancelarUsuario.style.display = 'none';
    errorUsuarioNombre.textContent = '';
    errorUsuarioEmail.textContent = '';
    inputUsuarioNombre.classList.remove('input-error');
    inputUsuarioEmail.classList.remove('input-error');
}

formUsuario.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormUsuario()) return;

    const datos = {
        nombre: inputUsuarioNombre.value.trim(),
        email: inputUsuarioEmail.value.trim()
    };
    const id = inputUsuarioId.value;

    try {
        if (id) {
            await fetchAPI(`/api/usuarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            mostrarNotificacion('Usuario actualizado', 'exito');
        } else {
            await fetchAPI('/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            mostrarNotificacion('Usuario creado', 'exito');
        }
        limpiarFormUsuario();
        cargarUsuarios();
        cargarSelectUsuarios(); // Actualizar select de compras
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
});

async function editarUsuario(id) {
    try {
        const resp = await fetchAPI(`/api/usuarios/${id}`);
        inputUsuarioId.value = resp.data.id;
        inputUsuarioNombre.value = resp.data.nombre;
        inputUsuarioEmail.value = resp.data.email;
        formTituloUsuario.textContent = 'Editar Usuario';
        btnGuardarUsuario.textContent = 'Actualizar';
        btnCancelarUsuario.style.display = 'inline-block';
        cambiarSeccion('usuarios');
        formUsuario.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

function confirmarEliminarUsuario(id, nombre) {
    if (confirm(`¿Eliminar a "${nombre}" y todas sus compras?`)) {
        eliminarUsuario(id);
    }
}

async function eliminarUsuario(id) {
    try {
        await fetchAPI(`/api/usuarios/${id}`, { method: 'DELETE' });
        mostrarNotificacion('Usuario eliminado', 'exito');
        if (inputUsuarioId.value === String(id)) limpiarFormUsuario();
        cargarUsuarios();
        cargarSelectUsuarios();
        cargarCompras();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

// Ver compras de un usuario específico
async function verComprasUsuario(id) {
    try {
        const resp = await fetchAPI(`/api/compras/usuario/${id}`);
        const { usuario, compras, total_compras, total_gastado } = resp.data;

        let mensaje = `${usuario.nombre} tiene ${total_compras} compra(s).\nTotal gastado: $${total_gastado}\n\n`;
        compras.forEach(c => {
            mensaje += `- ${c.producto} x${c.cantidad} = $${parseFloat(c.total).toFixed(2)}\n`;
        });

        alert(mensaje);
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

btnCancelarUsuario.addEventListener('click', limpiarFormUsuario);

// ============================================================
// 3. MÓDULO DE VIDEOS
// ============================================================
const formVideo = document.getElementById('form-video');
const inputVideoId = document.getElementById('video-id');
const inputVideoTitulo = document.getElementById('video-titulo');
const inputVideoDescripcion = document.getElementById('video-descripcion');
const formTituloVideo = document.getElementById('form-titulo-video');
const btnGuardarVideo = document.getElementById('btn-guardar-video');
const btnCancelarVideo = document.getElementById('btn-cancelar-video');
const tbodyVideos = document.getElementById('tbody-videos');
const tablaVideos = document.getElementById('tabla-videos');
const cargaVideos = document.getElementById('carga-videos');
const contadorVideos = document.getElementById('contador-videos');
const errorVideoTitulo = document.getElementById('error-video-titulo');
const errorVideoDescripcion = document.getElementById('error-video-descripcion');

async function cargarVideos() {
    try {
        const resp = await fetchAPI('/api/videos');
        cargaVideos.style.display = 'none';

        if (resp.data.length === 0) {
            tablaVideos.style.display = 'none';
            cargaVideos.textContent = 'No hay videos registrados.';
            cargaVideos.style.display = 'block';
        } else {
            tablaVideos.style.display = 'table';
            tbodyVideos.innerHTML = '';
            resp.data.forEach(v => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${v.id}</td>
                    <td>${escapeHtml(v.titulo)}</td>
                    <td>${escapeHtml(v.descripcion)}</td>
                    <td>
                        <button class="btn-editar" onclick="editarVideo(${v.id})">Editar</button>
                        <button class="btn-eliminar" onclick="confirmarEliminarVideo(${v.id}, '${escapeHtml(v.titulo)}')">Eliminar</button>
                    </td>
                `;
                tbodyVideos.appendChild(fila);
            });
        }
        contadorVideos.textContent = `${resp.count}`;
    } catch (error) {
        mostrarNotificacion('Error al cargar videos: ' + error.message, 'error');
    }
}

function validarFormVideo() {
    let ok = true;
    const titulo = inputVideoTitulo.value.trim();
    const descripcion = inputVideoDescripcion.value.trim() ;

    if (!titulo || titulo.length < 2) {
        errorVideoTitulo.textContent = 'Mínimo 2 caracteres';
        inputVideoTitulo.classList.add('input-error');
        ok = false;
    } else {
        errorVideoTitulo.textContent = '';
        inputVideoTitulo.classList.remove('input-error');
    }

    if (!descripcion || descripcion.length < 2) {
        errorVideoDescripcion.textContent = 'Mínimo 2 caracteres';
        inputVideoDescripcion.classList.add('input-error');
        ok = false;
    } else {
        errorVideoDescripcion.textContent = '';
        inputVideoDescripcion.classList.remove('input-error');
    }

    return ok;
}

function limpiarFormVideo() {
    formVideo.reset();
    inputVideoId.value = '';
    formTituloVideo.textContent = 'Agregar Video';
    btnGuardarVideo.textContent = 'Guardar';
    btnCancelarVideo.style.display = 'none';
    errorVideoTitulo.textContent = '';
    errorVideoDescripcion.textContent = '';
    inputVideoTitulo.classList.remove('input-error');
    inputVideoDescripcion.classList.remove('input-error');
}

formVideo.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormVideo()) return;

    const datos = {
        titulo: inputVideoTitulo.value.trim(),
        descripcion: inputVideoDescripcion.value.trim()
    };
    const id = inputVideoId.value;

    try {
        if (id) {
            await fetchAPI(`/api/videos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            mostrarNotificacion('Video actualizado', 'exito');
        } else {
            await fetchAPI('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            mostrarNotificacion('Video creado', 'exito');
        }
        limpiarFormVideo();
        cargarVideos();
        cargarSelectVideos();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
});

async function editarVideo(id) {
    try {
        const resp = await fetchAPI(`/api/videos/${id}`);
        inputVideoId.value = resp.data.id;
        inputVideoTitulo.value = resp.data.titulo;
        inputVideoDescripcion.value = resp.data.descripcion;
        formTituloVideo.textContent = 'Editar Video';
        btnGuardarVideo.textContent = 'Actualizar';
        btnCancelarVideo.style.display = 'inline-block';
        cambiarSeccion('videos');
        formVideo.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

function confirmarEliminarVideo(id, nombre) {
    if (confirm(`¿Eliminar "${nombre}"?\nSi tiene compras asociadas, no se podrá eliminar.`)) {
        eliminarVideo(id);
    }
}

async function eliminarVideo(id) {
    try {
        await fetchAPI(`/api/videos/${id}`, { method: 'DELETE' });
        mostrarNotificacion('Video eliminado', 'exito');
        if (inputVideoId.value === String(id)) limpiarFormVideo();
        cargarVideos();
        cargarSelectVideos();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

btnCancelarVideo.addEventListener('click', limpiarFormVideo);

// ============================================================
// 4. MÓDULO DE COMPRAS
// ============================================================
// const formCompra = document.getElementById('form-compra');
// const selectUsuario = document.getElementById('compra-usuario');
// const selectProducto = document.getElementById('compra-producto');
// const inputCantidad = document.getElementById('compra-cantidad');
// const tbodyCompras = document.getElementById('tbody-compras');
// const tablaCompras = document.getElementById('tabla-compras');
// const cargaCompras = document.getElementById('carga-compras');
// const contadorCompras = document.getElementById('contador-compras');
// const errorCompraUsuario = document.getElementById('error-compra-usuario');
// const errorCompraProducto = document.getElementById('error-compra-producto');
// const errorCompraCantidad = document.getElementById('error-compra-cantidad');

// // Llenar el <select> de usuarios con datos de la API
// // Los <select> se llenan dinámicamente cada vez que cambian
// // los datos, para mantenerlos sincronizados con la BD.
// async function cargarSelectUsuarios() {
//     try {
//         const resp = await fetchAPI('/api/usuarios');
//         selectUsuario.innerHTML = '<option value="">-- Seleccionar usuario --</option>';
//         resp.data.forEach(u => {
//             // createElement es más seguro que innerHTML para datos dinámicos
//             const option = document.createElement('option');
//             option.value = u.id;
//             option.textContent = `${u.nombre} (${u.descripcion})`;
//             selectUsuario.appendChild(option);
//         });
//     } catch (error) {
//         console.error('Error cargando select usuarios:', error);
//     }
// }

// async function cargarSelectVideos() {
//     try {
//         const resp = await fetchAPI('/api/productos');
//         selectProducto.innerHTML = '<option value="">-- Seleccionar producto --</option>';
//         resp.data.forEach(p => {
//             const option = document.createElement('option');
//             option.value = p.id;
//             option.textContent = `${p.nombre} — $${parseFloat(p.precio).toFixed(2)}`;
//             selectProducto.appendChild(option);
//         });
//     } catch (error) {
//         console.error('Error cargando select productos:', error);
//     }
// }

// async function cargarCompras() {
//     try {
//         const resp = await fetchAPI('/api/compras');
//         cargaCompras.style.display = 'none';

//         if (resp.data.length === 0) {
//             tablaCompras.style.display = 'none';
//             cargaCompras.textContent = 'No hay compras registradas.';
//             cargaCompras.style.display = 'block';
//         } else {
//             tablaCompras.style.display = 'table';
//             tbodyCompras.innerHTML = '';
//             resp.data.forEach(c => {
//                 const fila = document.createElement('tr');
//                 fila.innerHTML = `
//                     <td>${c.id}</td>
//                     <td>${escapeHtml(c.usuario_nombre)}</td>
//                     <td>${escapeHtml(c.producto_nombre)}</td>
//                     <td>$${parseFloat(c.producto_precio).toFixed(2)}</td>
//                     <td>${c.cantidad}</td>
//                     <td><strong>$${parseFloat(c.total).toFixed(2)}</strong></td>
//                     <td>${formatearFechaHora(c.fecha_compra)}</td>
//                     <td>
//                         <button class="btn-eliminar" onclick="confirmarEliminarCompra(${c.id})">Eliminar</button>
//                     </td>
//                 `;
//                 tbodyCompras.appendChild(fila);
//             });
//         }
//         contadorCompras.textContent = `${resp.count}`;
//     } catch (error) {
//         mostrarNotificacion('Error al cargar compras: ' + error.message, 'error');
//     }
// }

// function validarFormCompra() {
//     let ok = true;

//     if (!selectUsuario.value) {
//         errorCompraUsuario.textContent = 'Selecciona un usuario';
//         selectUsuario.classList.add('input-error');
//         ok = false;
//     } else {
//         errorCompraUsuario.textContent = '';
//         selectUsuario.classList.remove('input-error');
//     }

//     if (!selectProducto.value) {
//         errorCompraProducto.textContent = 'Selecciona un producto';
//         selectProducto.classList.add('input-error');
//         ok = false;
//     } else {
//         errorCompraProducto.textContent = '';
//         selectProducto.classList.remove('input-error');
//     }

//     const cant = parseInt(inputCantidad.value);
//     if (!cant || cant < 1) {
//         errorCompraCantidad.textContent = 'Mínimo 1';
//         inputCantidad.classList.add('input-error');
//         ok = false;
//     } else {
//         errorCompraCantidad.textContent = '';
//         inputCantidad.classList.remove('input-error');
//     }

//     return ok;
// }

// formCompra.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     if (!validarFormCompra()) return;

//     try {
//         const resp = await fetchAPI('/api/compras', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 usuario_id: parseInt(selectUsuario.value),
//                 producto_id: parseInt(selectProducto.value),
//                 cantidad: parseInt(inputCantidad.value)
//             })
//         });

//         mostrarNotificacion(
//             `Compra registrada: ${resp.data.usuario} compró ${resp.data.cantidad}x ${resp.data.producto} ($${resp.data.total})`,
//             'exito'
//         );
//         formCompra.reset();
//         inputCantidad.value = '1';
//         cargarCompras();
//     } catch (error) {
//         mostrarNotificacion(error.message, 'error');
//     }
// });

// function confirmarEliminarCompra(id) {
//     if (confirm('¿Eliminar esta compra?')) {
//         eliminarCompra(id);
//     }
// }

// async function eliminarCompra(id) {
//     try {
//         await fetchAPI(`/api/compras/${id}`, { method: 'DELETE' });
//         mostrarNotificacion('Compra eliminada', 'exito');
//         cargarCompras();
//     } catch (error) {
//         mostrarNotificacion(error.message, 'error');
//     }
// }

// // ============================================================
// // 5. NAVEGACIÓN POR PESTAÑAS
// // ============================================================
// Esta función muestra una sección y oculta las demás.
// También actualiza la pestaña activa visualmente.
// Es un patrón básico de SPA (Single Page Application):
// cambiar contenido sin recargar la página.
function cambiarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(s => {
        s.style.display = 'none';
    });

    // Desactivar todas las pestañas
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    document.getElementById(`seccion-${seccion}`).style.display = 'block';

    // Activar la pestaña correspondiente
    // Array.from convierte NodeList a Array para poder usar find()
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const tabActiva = tabs.find(t => t.textContent.toLowerCase() === seccion);
    if (tabActiva) tabActiva.classList.add('active');

    // Si cambiamos a compras, recargar selects con datos actuales
    if (seccion === 'compras') {
        cargarSelectUsuarios();
        cargarSelectProductos();
        cargarCompras();
    }
}

// ============================================================
// 6. INICIALIZACIÓN
// ============================================================
// Al cargar la página, cargamos todos los datos iniciales.
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    cargarVideos();
    cargarSelectUsuarios();
    cargarSelectProductos();
});
