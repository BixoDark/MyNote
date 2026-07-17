// ui.js

const SELECTORES = {
    formulario: '#formTarea',
    texto: '#tareaTexto',
    categoria: '#tipoTarea',
    fecha: '#fechaTarea',
    hora: '#horaTarea',
    botonGuardar: '#formTarea button[type="submit"]'
};

const CATEGORIAS = ['importante', 'relevante', 'nota', 'compra'];

const formatos = {
    fecha: new Intl.DateTimeFormat(navigator.language, { year: 'numeric', month: 'long', day: 'numeric' }),
    hora: new Intl.DateTimeFormat(navigator.language, { hour: 'numeric', minute: 'numeric', hour12: true })
};

const DOM = { bloques: {} };

// Formatea fechas y horas evitando redundancia
const formatearFechaHora = (cadena, tipo) => {
    if (!cadena) return '';
    const [a, b, c] = cadena.split(/[-:]/).map(Number);
    return formatos[tipo].format(tipo === 'fecha' ? new Date(a, b - 1, c) : new Date().setHours(a, b, 0, 0));
};

// DRY: Centraliza el cambio de visibilidad de las listas y sus estados vacíos
const alternarBloque = (bloque, mostrarLista) => {
    bloque.lista.classList.toggle('d-none', !mostrarLista);
    bloque.vacio.classList.toggle('d-none', mostrarLista);
};

// DRY: Centraliza la iteración sobre los contenedores de categorías
const iterarBloques = (callback) => Object.values(DOM.bloques).forEach(callback);

const crearNodoTarea = (tarea) => {
    const completada = tarea.estado === 'completada';
    const item = document.createElement('li');
    item.className = `list-group-item d-flex justify-content-between align-items-center ${completada ? 'bg-light' : ''}`;

    const tiempo = [formatearFechaHora(tarea.hora, 'hora'), formatearFechaHora(tarea.fecha, 'fecha')]
        .filter(Boolean)
        .join(' - ');

    const botones = [
        { accion: 'completar', color: completada ? 'btn-secondary' : 'btn-success', icono: 'check-lg' },
        { accion: 'editar', color: 'btn-warning', icono: 'pencil' },
        { accion: 'eliminar', color: 'btn-danger', icono: 'trash' }
    ].map(({ accion, color, icono }) => `
        <button class="btn btn-sm ${color} accion-${accion}" data-id="${tarea.id}">
            <i class="bi bi-${icono} pointer-events-none"></i>
        </button>`).join('');

    item.innerHTML = `
        <div class="ms-2 me-auto ${completada ? 'text-decoration-line-through text-muted' : ''}">
            <div class="fw-bold">${tarea.tarea}</div>
            ${tiempo ? `<small class="text-secondary"><i class="bi bi-clock me-1"></i>${tiempo}</small>` : ''}
        </div>
        <div class="d-flex gap-2">${botones}</div>`;
    
    return item;
};

export const UI = {
    inicializarDOM() {
        Object.entries(SELECTORES).forEach(([clave, selector]) => {
            DOM[clave] = document.querySelector(selector);
        });

        CATEGORIAS.forEach(cat => {
            const sufijo = cat.charAt(0).toUpperCase() + cat.slice(1) + 's';
            DOM.bloques[cat] = {
                lista: document.querySelector(`#lista${sufijo}`),
                vacio: document.querySelector(`#vacio${sufijo}`)
            };
        });
    },

    obtenerElementosDOM: () => DOM,

    obtenerDatosFormulario: () => ({
        tarea: DOM.texto.value,
        categoria: DOM.categoria.value,
        fecha: DOM.fecha.value,
        hora: DOM.hora.value
    }),

    cargarDatosEnFormulario(tarea) {
        DOM.texto.value = tarea.tarea;
        DOM.categoria.value = tarea.categoria;
        DOM.fecha.value = tarea.fecha || '';
        DOM.hora.value = tarea.hora || '';
    },

    validarFormulario() {
        const esValido = DOM.formulario.checkValidity();
        DOM.formulario.classList.toggle('was-validated', !esValido);
        return esValido;
    },

    limpiarFormulario(idEditandoCallback) {
        DOM.formulario?.reset();
        DOM.formulario?.classList.remove('was-validated');
        if (idEditandoCallback) idEditandoCallback();
        this.actualizarBotonGuardar(false, false);
    },

    mostrarEsperaCarga() {
        iterarBloques(bloque => {
            bloque.lista.innerHTML = `
                <li class="list-group-item placeholder-glow">
                    <span class="placeholder col-7 bg-secondary opacity-25"></span> 
                    <span class="placeholder col-4 bg-secondary opacity-25"></span>
                </li>`;
            alternarBloque(bloque, true);
        });
    },

    limpiarBloques() {
        iterarBloques(bloque => {
            bloque.lista.innerHTML = '';
            alternarBloque(bloque, false);
        });
    },

    renderizarTareas(tareas) {
        this.limpiarBloques();
        tareas.forEach(tarea => {
            const bloque = DOM.bloques[tarea.categoria];
            if (bloque) {
                alternarBloque(bloque, true);
                bloque.lista.appendChild(crearNodoTarea(tarea));
            }
        });
    },

    actualizarBotonGuardar(cargando = false, editando = false) {
        if (!DOM.botonGuardar) return;
        DOM.botonGuardar.disabled = cargando;
        
        DOM.botonGuardar.innerHTML = cargando 
            ? `<span class="spinner-border spinner-border-sm me-1"></span>Procesando...` 
            : editando ? 'Actualizar Tarea' : 'Agregar Tarea';

        if (!cargando) {
            DOM.botonGuardar.className = `btn ${editando ? 'btn-warning' : 'btn-primary'}`;
        }
    }
};