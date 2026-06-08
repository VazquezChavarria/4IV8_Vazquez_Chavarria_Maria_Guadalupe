const API = 'http://localhost:3000/api';

// ── ESTADO DE LA API (panel informativo) ─────────────────
function actualizarEstadoAPI(metodo, url, codigo) {
  document.getElementById('api-metodo').textContent  = metodo;
  document.getElementById('api-metodo').className    = `badge badge-${metodo.toLowerCase()}`;
  document.getElementById('api-url').textContent     = url;
  document.getElementById('api-codigo').textContent  = codigo;
  document.getElementById('api-codigo').className    = `badge badge-${codigo}`;
}

// ── NOTIFICACIONES ────────────────────────────────────────
function mostrarNotificacion(texto, tipo = 'ok') {
  const el = document.getElementById('notificacion');
  el.textContent  = texto;
  el.className    = `notificacion ${tipo}`;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// ── NAVEGACIÓN POR PESTAÑAS ───────────────────────────────
function cambiarSeccion(nombre) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`seccion-${nombre}`).classList.add('activa');
  document.querySelector(`.tab[data-sec="${nombre}"]`).classList.add('active');

  if (nombre === 'categorias') cargarCategorias();
  if (nombre === 'videos')     { cargarVideos(); cargarSelectCategorias(); }
  if (nombre === 'ediciones')  { cargarEdiciones(); cargarSelectVideos(); }
}

// ═══════════════════════════════════════════════════════════
// CATEGORÍAS
// ═══════════════════════════════════════════════════════════

async function cargarCategorias() {
  const url = `${API}/categorias`;
  actualizarEstadoAPI('GET', url, '...');
  const res  = await fetch(url);
  const data = await res.json();
  actualizarEstadoAPI('GET', url, res.status);

  document.getElementById('carga-categorias').style.display = 'none';
  const tabla = document.getElementById('tabla-categorias');
  tabla.style.display = 'table';
  document.getElementById('contador-categorias').textContent = data.length;

  document.getElementById('tbody-categorias').innerHTML = data.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.nombre}</td>
      <td>${c.descripcion || '—'}</td>
      <td>
        <button class="btn-editar" onclick="editarCategoria(${c.id},'${c.nombre.replace(/'/g,"\\'")}','${(c.descripcion||'').replace(/'/g,"\\'")}')">Editar</button>
        <button class="btn-borrar" onclick="borrarCategoria(${c.id})">Borrar</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('form-categoria').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id  = document.getElementById('cat-id').value;
  const body = {
    nombre:      document.getElementById('cat-nombre').value.trim(),
    descripcion: document.getElementById('cat-descripcion').value.trim()
  };
  if (!body.nombre) { document.getElementById('error-cat-nombre').textContent = 'El nombre es obligatorio'; return; }
  document.getElementById('error-cat-nombre').textContent = '';

  const url    = id ? `${API}/categorias/${id}` : `${API}/categorias`;
  const metodo = id ? 'PUT' : 'POST';
  actualizarEstadoAPI(metodo, url, '...');
  const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  actualizarEstadoAPI(metodo, url, res.status);

  if (res.ok) {
    mostrarNotificacion(id ? '✅ Categoría actualizada' : '✅ Categoría creada');
    cancelarCategoria();
    cargarCategorias();
  } else {
    const err = await res.json();
    mostrarNotificacion(err.error, 'error');
  }
});

function editarCategoria(id, nombre, descripcion) {
  document.getElementById('cat-id').value           = id;
  document.getElementById('cat-nombre').value       = nombre;
  document.getElementById('cat-descripcion').value  = descripcion;
  document.getElementById('form-titulo-categoria').textContent = 'Editar Categoría';
  document.getElementById('btn-cancelar-categoria').style.display = 'inline-block';
}

function cancelarCategoria() {
  document.getElementById('form-categoria').reset();
  document.getElementById('cat-id').value = '';
  document.getElementById('form-titulo-categoria').textContent = 'Agregar Categoría';
  document.getElementById('btn-cancelar-categoria').style.display = 'none';
  document.getElementById('error-cat-nombre').textContent = '';
}

async function borrarCategoria(id) {
  if (!confirm('¿Eliminar esta categoría?')) return;
  const url = `${API}/categorias/${id}`;
  actualizarEstadoAPI('DELETE', url, '...');
  const res = await fetch(url, { method: 'DELETE' });
  actualizarEstadoAPI('DELETE', url, res.status);
  if (res.ok) { mostrarNotificacion('🗑 Categoría eliminada'); cargarCategorias(); }
}

// ═══════════════════════════════════════════════════════════
// VIDEOS
// ═══════════════════════════════════════════════════════════

async function cargarSelectCategorias() {
  const res  = await fetch(`${API}/categorias`);
  const data = await res.json();
  const sel  = document.getElementById('video-categoria');
  sel.innerHTML = '<option value="">-- Sin categoría --</option>';
  data.forEach(c => sel.add(new Option(c.nombre, c.id)));
}

async function cargarVideos() {
  const url = `${API}/videos`;
  actualizarEstadoAPI('GET', url, '...');
  const res  = await fetch(url);
  const data = await res.json();
  actualizarEstadoAPI('GET', url, res.status);

  document.getElementById('carga-videos').style.display = 'none';
  const tabla = document.getElementById('tabla-videos');
  tabla.style.display = 'table';
  document.getElementById('contador-videos').textContent = data.length;

  document.getElementById('tbody-videos').innerHTML = data.map(v => `
    <tr>
      <td>${v.id}</td>
      <td>${v.titulo}</td>
      <td>${v.duracion || '—'}</td>
      <td><span class="badge badge-${v.estado}">${etiquetaEstado(v.estado)}</span></td>
      <td>${v.categoria_nombre || '—'}</td>
      <td>
        <button class="btn-editar" onclick="editarVideo(${v.id})">Editar</button>
        <button class="btn-borrar" onclick="borrarVideo(${v.id})">Borrar</button>
      </td>
    </tr>
  `).join('');
}

function etiquetaEstado(e) {
  return { pendiente: 'Pendiente', en_proceso: 'En proceso', completado: 'Completado' }[e] || e;
}

document.getElementById('form-video').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id   = document.getElementById('video-id').value;
  const body = {
    titulo:       document.getElementById('video-titulo').value.trim(),
    duracion:     document.getElementById('video-duracion').value.trim(),
    estado:       document.getElementById('video-estado').value,
    categoria_id: document.getElementById('video-categoria').value || null
  };
  if (!body.titulo) { document.getElementById('error-video-titulo').textContent = 'El título es obligatorio'; return; }
  document.getElementById('error-video-titulo').textContent = '';

  const url    = id ? `${API}/videos/${id}` : `${API}/videos`;
  const metodo = id ? 'PUT' : 'POST';
  actualizarEstadoAPI(metodo, url, '...');
  const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  actualizarEstadoAPI(metodo, url, res.status);

  if (res.ok) {
    mostrarNotificacion(id ? '✅ Video actualizado' : '✅ Video creado');
    cancelarVideo();
    cargarVideos();
  } else {
    const err = await res.json();
    mostrarNotificacion(err.error, 'error');
  }
});

async function editarVideo(id) {
  const res = await fetch(`${API}/videos/${id}`);
  const v   = await res.json();
  document.getElementById('video-id').value        = v.id;
  document.getElementById('video-titulo').value    = v.titulo;
  document.getElementById('video-duracion').value  = v.duracion || '';
  document.getElementById('video-estado').value    = v.estado;
  document.getElementById('video-categoria').value = v.categoria_id || '';
  document.getElementById('form-titulo-video').textContent = 'Editar Video';
  document.getElementById('btn-cancelar-video').style.display = 'inline-block';
}

function cancelarVideo() {
  document.getElementById('form-video').reset();
  document.getElementById('video-id').value = '';
  document.getElementById('form-titulo-video').textContent = 'Agregar Video';
  document.getElementById('btn-cancelar-video').style.display = 'none';
  document.getElementById('error-video-titulo').textContent = '';
}

async function borrarVideo(id) {
  if (!confirm('¿Eliminar este video?')) return;
  const url = `${API}/videos/${id}`;
  actualizarEstadoAPI('DELETE', url, '...');
  const res = await fetch(url, { method: 'DELETE' });
  actualizarEstadoAPI('DELETE', url, res.status);
  if (res.ok) { mostrarNotificacion('🗑 Video eliminado'); cargarVideos(); }
}

// ═══════════════════════════════════════════════════════════
// EDICIONES
// ═══════════════════════════════════════════════════════════

async function cargarSelectVideos() {
  const res  = await fetch(`${API}/videos`);
  const data = await res.json();
  const sel  = document.getElementById('edicion-video');
  sel.innerHTML = '<option value="">-- Seleccionar --</option>';
  data.forEach(v => sel.add(new Option(v.titulo, v.id)));
}

async function cargarEdiciones() {
  const url = `${API}/ediciones`;
  actualizarEstadoAPI('GET', url, '...');
  const res  = await fetch(url);
  const data = await res.json();
  actualizarEstadoAPI('GET', url, res.status);

  document.getElementById('carga-ediciones').style.display = 'none';
  const tabla = document.getElementById('tabla-ediciones');
  tabla.style.display = 'table';
  document.getElementById('contador-ediciones').textContent = data.length;

  document.getElementById('tbody-ediciones').innerHTML = data.map(ed => `
    <tr>
      <td>${ed.id}</td>
      <td>${ed.video_titulo || '—'}</td>
      <td>${ed.editor}</td>
      <td>${ed.notas || '—'}</td>
      <td>${new Date(ed.fecha).toLocaleDateString('es-MX')}</td>
      <td>
        <button class="btn-editar" onclick="editarEdicion(${ed.id})">Editar</button>
        <button class="btn-borrar" onclick="borrarEdicion(${ed.id})">Borrar</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('form-edicion').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id   = document.getElementById('edicion-id').value;
  const body = {
    video_id: document.getElementById('edicion-video').value,
    editor:   document.getElementById('edicion-editor').value.trim(),
    notas:    document.getElementById('edicion-notas').value.trim()
  };
  if (!body.video_id) { document.getElementById('error-edicion-video').textContent = 'Selecciona un video'; return; }
  if (!body.editor)   { document.getElementById('error-edicion-editor').textContent = 'El editor es obligatorio'; return; }
  document.getElementById('error-edicion-video').textContent  = '';
  document.getElementById('error-edicion-editor').textContent = '';

  const url    = id ? `${API}/ediciones/${id}` : `${API}/ediciones`;
  const metodo = id ? 'PUT' : 'POST';
  actualizarEstadoAPI(metodo, url, '...');
  const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  actualizarEstadoAPI(metodo, url, res.status);

  if (res.ok) {
    mostrarNotificacion(id ? '✅ Edición actualizada' : '✅ Edición registrada');
    cancelarEdicion();
    cargarEdiciones();
  } else {
    const err = await res.json();
    mostrarNotificacion(err.error, 'error');
  }
});

async function editarEdicion(id) {
  const res = await fetch(`${API}/ediciones/${id}`);
  const ed  = await res.json();
  document.getElementById('edicion-id').value     = ed.id;
  document.getElementById('edicion-video').value  = ed.video_id;
  document.getElementById('edicion-editor').value = ed.editor;
  document.getElementById('edicion-notas').value  = ed.notas || '';
  document.getElementById('form-titulo-edicion').textContent = 'Editar Edición';
  document.getElementById('btn-cancelar-edicion').style.display = 'inline-block';
}

function cancelarEdicion() {
  document.getElementById('form-edicion').reset();
  document.getElementById('edicion-id').value = '';
  document.getElementById('form-titulo-edicion').textContent = 'Registrar Edición';
  document.getElementById('btn-cancelar-edicion').style.display = 'none';
}

async function borrarEdicion(id) {
  if (!confirm('¿Eliminar esta edición?')) return;
  const url = `${API}/ediciones/${id}`;
  actualizarEstadoAPI('DELETE', url, '...');
  const res = await fetch(url, { method: 'DELETE' });
  actualizarEstadoAPI('DELETE', url, res.status);
  if (res.ok) { mostrarNotificacion('🗑 Edición eliminada'); cargarEdiciones(); }
}

// ── INICIO ────────────────────────────────────────────────
cargarCategorias();
