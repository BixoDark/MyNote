import { GestorTareas } from './clases/GestorTarea.js';

const UI_SELECTORS = {
    form: '#formTarea',
    inputTexto: '#tareaTexto',
    inputCategoria: '#tipoTarea',
    inputFecha: '#fechaTarea',
    inputHora: '#horaTarea',
    contenedores: {
        importante: { lista: '#listaImportantes', vacio: '#vacioImportantes' },
        relevante: { lista: '#listaRelevantes', vacio: '#vacioRelevantes' },
        nota: { lista: '#listaNotas', vacio: '#vacioNotas' },
        compra: { lista: '#listaCompras', vacio: '#vacioCompras' }
    }
};

const state = {
    gestor: new GestorTareas()
};

const getElement = (selector) => document.querySelector(selector);

const toggleVisibilidad = (lista, vacio, mostrarLista) => {
    if (mostrarLista) {
        lista.classList.remove('d-none');
        vacio.classList.add('d-none');
    } else {
        lista.classList.add('d-none');
        vacio.classList.remove('d-none');
    }
};

const construirHtmlTarea = (tarea) => {
    const completada = tarea.estado === 'completada';
    const li = document.createElement('li');
    li.className = `list-group-item d-flex justify-content-between align-items-center ${completada ? 'bg-light' : ''}`;

    const detallesTiempo = (tarea.fecha || tarea.hora)
        ? `<small class="text-secondary"><i class="bi bi-clock me-1"></i>${tarea.fecha || ''} ${tarea.hora || ''}</small>`
        : '';

    li.innerHTML = `
        <div class="ms-2 me-auto ${completada ? 'text-decoration-line-through text-muted' : ''}">
            <div class="fw-bold">${tarea.tarea}</div>
            ${detallesTiempo}
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-sm ${completada ? 'btn-secondary' : 'btn-success'} action-completar" data-id="${tarea.id}">
                <i class="bi bi-check-lg pointer-events-none"></i>
            </button>
            <button class="btn btn-sm btn-danger action-eliminar" data-id="${tarea.id}">
                <i class="bi bi-trash pointer-events-none"></i>
            </button>
        </div>
    `;
    return li;
};

const renderizarUI = async () => {
    const tareas = await state.gestor.obtenerTareas();

    Object.values(UI_SELECTORS.contenedores).forEach(({ lista, vacio }) => {
        const elLista = getElement(lista);
        elLista.innerHTML = '';
        toggleVisibilidad(elLista, getElement(vacio), false);
    });

    tareas.forEach(tarea => {
        const config = UI_SELECTORS.contenedores[tarea.categoria];
        if (!config) return;

        const elLista = getElement(config.lista);
        const elVacio = getElement(config.vacio);

        toggleVisibilidad(elLista, elVacio, true);
        elLista.appendChild(construirHtmlTarea(tarea));
    });
};

const manejarSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const texto = getElement(UI_SELECTORS.inputTexto).value;
    const categoria = getElement(UI_SELECTORS.inputCategoria).value;
    const fecha = getElement(UI_SELECTORS.inputFecha).value;
    const hora = getElement(UI_SELECTORS.inputHora).value;

    state.gestor.crearTarea(texto, categoria, fecha, hora);

    form.reset();
    form.classList.remove('was-validated');
    await renderizarUI();
};

const manejarAcciones = async (e) => {
    const btnEliminar = e.target.closest('.action-eliminar');
    const btnCompletar = e.target.closest('.action-completar');

    if (btnEliminar) {
        state.gestor.eliminarTarea(btnEliminar.dataset.id);
        await renderizarUI();
    }

    if (btnCompletar) {
        state.gestor.finalizarTarea(btnCompletar.dataset.id);
        await renderizarUI();
    }
};

const init = async () => {
    getElement(UI_SELECTORS.form).addEventListener('submit', manejarSubmit);
    document.addEventListener('click', manejarAcciones);
    await renderizarUI();
};

document.addEventListener('DOMContentLoaded', init);