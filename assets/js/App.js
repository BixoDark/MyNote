// app.js
import { GestorTareas } from './clases/GestorTarea.js';
import { UI } from './ui.js';

const estado = {
    gestor: new GestorTareas(),
    idEditando: null,
    cargando: false
};

const esperar = (ms) => new Promise(resolver => setTimeout(resolver, ms));
const resetearIDEdicion = () => { estado.idEditando = null; };
const limpiarFormularioCompleto = () => UI.limpiarFormulario(resetearIDEdicion);

const abrirModalDesdeBoton = (categoria) => {
    UI.abrirModal(categoria, false);
};

const actualizarPantalla = async (saltarEspera = false) => {
    try {
        if (!saltarEspera && !estado.cargando) {
            estado.cargando = true;
            UI.mostrarEsperaCarga();
            await esperar(2000);
            estado.cargando = false;
        }

        const tareas = await estado.gestor.obtenerTareas();
        UI.renderizarTareas(tareas);

        UI.actualizarContadores(
            estado.gestor.total,
            estado.gestor.pendientes,
            estado.gestor.finalizadas
        );

    } catch (error) {
        console.error(error.message);
        estado.cargando = false;
    }
};

const procesarFormulario = async (evento) => {
    evento.preventDefault();
    if (!UI.validarFormulario()) return;

    try {
        UI.actualizarBotonGuardar(true);
        await esperar(1000);

        const datosTarea = UI.obtenerDatosFormulario();
        const esEdicion = !!estado.idEditando;

        await estado.gestor.guardar(estado.idEditando, datosTarea);

        limpiarFormularioCompleto();
        UI.cerrarModal();
        await actualizarPantalla(true);

        const mensaje = esEdicion ? "Tarea editada" : "Tarea agregada";
        UI.mostrarNotificacionTemporal(mensaje);

    } catch (error) {
        console.error(error.message);
    } finally {
        UI.actualizarBotonGuardar(false, !!estado.idEditando);
    }
};

const procesarAcciones = async (evento) => {
    const boton = evento.target.closest('button');
    if (!boton) return;

    const { id, categoria } = boton.dataset;
    const clases = boton.classList;
    
    const contenidoOriginal = boton.innerHTML;

    try {
        if (clases.contains('accion-abrir-modal')) {
            abrirModalDesdeBoton(categoria);
            return;
        }

        if (clases.contains('accion-eliminar')) {
            const tarea = estado.gestor.obtenerTareaPorId(id);
            UI.mostrarConfirmacionEliminar(tarea, async () => {
                try {
                    await estado.gestor.eliminarTarea(id);
                    if (estado.idEditando === id) limpiarFormularioCompleto();
                    UI.mostrarNotificacionTemporal("Tarea eliminada", "danger");
                    await actualizarPantalla(true);
                } catch (error) {
                    console.error(error.message);
                    UI.mostrarNotificacionTemporal("Error al eliminar la tarea", "danger");
                } finally {
                    UI.cerrarConfirmacionEliminar();
                }
            });
            return;

        } else if (clases.contains('accion-completar')) {
            boton.disabled = true;
            boton.innerHTML = '<span class="spinner-border spinner-border-sm" style="width: 1rem; height: 1rem;"></span>';
            
            await estado.gestor.finalizarTarea(id);

            const tareaActualizada = estado.gestor.obtenerTareaPorId(id);
            const estaCompletada = tareaActualizada.estado === 'completada';

            const mensaje = estaCompletada ? "Tarea realizada" : "Tarea marcada como pendiente";
            const tipoNotificacion = estaCompletada ? "success" : "info";

            UI.mostrarNotificacionTemporal(mensaje, tipoNotificacion);

        } else if (clases.contains('accion-editar')) {
            const tarea = estado.gestor.obtenerTareaPorId(id);
            UI.cargarDatosEnFormulario(tarea);
            estado.idEditando = id;
            UI.abrirModal(tarea.categoria, true);
            return;
        }

        await actualizarPantalla(true);
        
    } catch (error) {
        console.error(error.message);
        boton.disabled = false;
        boton.innerHTML = contenidoOriginal;
        UI.mostrarNotificacionTemporal("Error al procesar la tarea", "danger");
    }
};

const iniciar = async () => {
    try {
        UI.inicializarDOM();
        const DOM = UI.obtenerElementosDOM();

        DOM.formulario.addEventListener('submit', procesarFormulario);
        DOM.formulario.addEventListener('reset', limpiarFormularioCompleto);
        document.addEventListener('click', procesarAcciones);

        await actualizarPantalla();
    } catch (error) {
        console.error(error.message);
    }
};

document.addEventListener('DOMContentLoaded', iniciar);