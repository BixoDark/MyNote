import Tarea from "./Tarea.js";

class GestorTareas {
    constructor() {
        this.tareas = [];
    }

    crearTarea(tarea, categoria, fecha, hora) {
        if (!tarea || tarea.trim() === "") {
            throw new Error("La descripción no puede estar vacía.");
        }
        const nuevaTarea = new Tarea(tarea, undefined, categoria, fecha, hora);
        this.tareas.push(nuevaTarea);
        this.#guardarEnLocalStorage();
        return nuevaTarea;
    }

    async obtenerTareas() {
        await this.#leerLocalStorage();
        return [...this.tareas].reverse();
    }

    obtenerTareaPorId(id) {
        return this.tareas.find((tarea) => tarea.id === id) || null;
    }

    finalizarTarea(id) {
        const tarea = this.obtenerTareaPorId(id);
        if (tarea) {
            tarea.estado = 'completada';
            this.#guardarEnLocalStorage();
        }
        return tarea;
    }

    eliminarTarea(id) {
        const indice = this.tareas.findIndex((tarea) => tarea.id === id);
        if (indice === -1) {
            return false;
        }
        this.tareas.splice(indice, 1);
        this.#guardarEnLocalStorage();
        return true;
    }

    tareasTotal() {
        return this.tareas.length;
    }

    tareasPendientes() {
        return this.tareas.filter(tarea => tarea.estado === 'pendiente').length;
    }

    tareasFinalizadas() {
        return this.tareas.filter(tarea => tarea.estado === 'completada').length;
    }

    #guardarEnLocalStorage() {
        localStorage.setItem("tareas", JSON.stringify(this.tareas));
    }

    async #leerLocalStorage() {
        const tareas = localStorage.getItem("tareas");

        if (tareas) {
            const tareasParseadas = JSON.parse(tareas);
            this.tareas = tareasParseadas.map(t => {
                const instancia = new Tarea(t.tarea, t.id, t.categoria, t.fecha, t.hora);
                instancia.estado = t.estado;
                instancia.fechaCreacion = t.fechaCreacion;
                return instancia;
            });
        } else {
            this.tareas = [];
        }
    }
}

export { GestorTareas };