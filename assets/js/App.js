import { GestorTareas } from './clases/GestorTarea.js';

const SELECTORES = {
    formulario: '#formTarea',
    texto: '#tareaTexto',
    categoria: '#tipoTarea',
    fecha: '#fechaTarea',
    hora: '#horaTarea',
    botonGuardar: '#formTarea button[type="submit"]'
};

const CATEGORIAS = ['importante', 'relevante', 'nota', 'compra'];

const estado = {
    gestor: new GestorTareas(),
    idEditando: null,
    cargando: false
};

const DOM = { bloques: {} };

const formatos = {
    fecha: new Intl.DateTimeFormat(navigator.language, { year: 'numeric', month: 'long', day: 'numeric' }),
    hora: new Intl.DateTimeFormat(navigator.language, { hour: 'numeric', minute: 'numeric', hour12: true })
};

const formatearFechaHora = (cadena, tipo) => {
    if (!cadena) return '';
    const [a, b, c] = cadena.split(/[-:]/).map(Number);
    return formatos[tipo].format(tipo === 'fecha' ? new Date(a, b - 1, c) : new Date().setHours(a, b, 0, 0));
};

const inicializarDOM = () => {
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
};

const alternarEstadoVistas = (lista, vacio, mostrarLista) => {
    lista.classList.toggle('d-none', !mostrarLista);
    vacio.classList.toggle('d-none', mostrarLista);
};

const crearNodoTarea = (tarea) => {
    const completada = tarea.estado === 'completada';
    const item = document.createElement('li');
    item.className = `list-group-item d-flex justify-content-between align-items-center ${completada ? 'bg-light' : ''}`;

    const tiempo = [formatearFechaHora(tarea.hora, 'hora'), formatearFechaHora(tarea.fecha, 'fecha')]
        .filter(Boolean)
        .join(' - ');

    item.innerHTML = `
        <div class="ms-2 me-auto ${completada ? 'text-decoration-line-through text-muted' : ''}">
            <div class="fw-bold">${tarea.tarea}</div>
            ${tiempo ? `<small class="text-secondary"><i class="bi bi-clock me-1"></i>${tiempo}</small>` : ''}
        </div>
        <div class="d-flex gap-2">
            ${[['completar', completada ? 'btn-secondary' : 'btn-success', 'check-lg'], ['editar', 'btn-warning', 'pencil'], ['eliminar', 'btn-danger', 'trash']]
            .map(([accion, color, icono]) => `
                <button class="btn btn-sm ${color} accion-${accion}" data-id="${tarea.id}">
                    <i class="bi bi-${icono} pointer-events-none"></i>
                </button>`).join('')}
        </div>`;
    return item;
};

const actualizarPantalla = async (saltarEspera = false) => {
    try {
        const tareas = await estado.gestor.obtenerTareas();

        if (!saltarEspera && !estado.cargando) {
            estado.cargando = true;
            Object.values(DOM.bloques).forEach(bloque => {
                bloque.lista.innerHTML = `<li class="list-group-item placeholder-glow"><span class="placeholder col-7 bg-secondary opacity-25"></span> <span class="placeholder col-4 bg-secondary opacity-25"></span></li>`;
                alternarEstadoVistas(bloque.lista, bloque.vacio, true);
            });
            await new Promise(resolver => setTimeout(resolver, 2000));
            estado.cargando = false;
        }

        Object.values(DOM.bloques).forEach(bloque => {
            bloque.lista.innerHTML = '';
            alternarEstadoVistas(bloque.lista, bloque.vacio, false);
        });

        tareas.forEach(tarea => {
            const bloque = DOM.bloques[tarea.categoria];
            if (bloque) {
                alternarEstadoVistas(bloque.lista, bloque.vacio, true);
                bloque.lista.appendChild(crearNodoTarea(tarea));
            }
        });
    } catch (error) {
        console.error(error.message);
        estado.cargando = false;
    }
};

const actualizarBotonGuardar = (cargando = false) => {
    if (!DOM.botonGuardar) return;
    DOM.botonGuardar.disabled = cargando;
    if (cargando) {
        DOM.botonGuardar.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Procesando...`;
    } else {
        const editando = !!estado.idEditando;
        DOM.botonGuardar.textContent = editando ? 'Actualizar Tarea' : 'Agregar Tarea';
        DOM.botonGuardar.className = `btn ${editando ? 'btn-warning' : 'btn-primary'}`;
    }
};

const procesarFormulario = async (evento) => {
    evento.preventDefault();
    if (!DOM.formulario.checkValidity()) {
        return DOM.formulario.classList.add('was-validated');
    }

    try {
        actualizarBotonGuardar(true);
        await new Promise(resolver => setTimeout(resolver, 2000));

        // CORRECCIÓN: Se cambió "guardarTarea" por "guardar"
        await estado.gestor.guardar(estado.idEditando, {
            tarea: DOM.texto.value,
            categoria: DOM.categoria.value,
            fecha: DOM.fecha.value,
            hora: DOM.hora.value
        });

        limpiarFormulario();
        await actualizarPantalla(true);
    } catch (error) {
        console.error(error.message);
    } finally {
        actualizarBotonGuardar(false);
    }
};

const procesarAcciones = async (evento) => {
    const boton = evento.target.closest('button');
    if (!boton) return;
    const { id } = boton.dataset;
    const clases = boton.classList;

    try {
        if (clases.contains('accion-eliminar')) {
            await estado.gestor.eliminarTarea(id);
            if (estado.idEditando === id) limpiarFormulario();
        } else if (clases.contains('accion-completar')) {
            await estado.gestor.finalizarTarea(id);
        } else if (clases.contains('accion-editar')) {
            const tarea = estado.gestor.obtenerTareaPorId(id);
            DOM.texto.value = tarea.tarea;
            DOM.categoria.value = tarea.categoria;
            DOM.fecha.value = tarea.fecha || '';
            DOM.hora.value = tarea.hora || '';
            estado.idEditando = id;
            actualizarBotonGuardar();
            return;
        }
        await actualizarPantalla(true);
    } catch (error) {
        console.error(error.message);
    }
};

const limpiarFormulario = () => {
    DOM.formulario?.reset();
    DOM.formulario?.classList.remove('was-validated');
    estado.idEditando = null;
    actualizarBotonGuardar();
};

const iniciar = async () => {
    try {
        inicializarDOM();
        DOM.formulario.addEventListener('submit', procesarFormulario);
        DOM.formulario.addEventListener('reset', limpiarFormulario);
        document.addEventListener('click', procesarAcciones);
        await actualizarPantalla();
    } catch (error) {
        console.error(error.message);
    }
};

document.addEventListener('DOMContentLoaded', iniciar);