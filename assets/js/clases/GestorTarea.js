import Tarea from "./Tarea.js";

class GestorTareas {
    constructor() {
        this.lista = [];
        this.#cargar();
    }

    guardar(id, datos) {
        if (!datos || typeof datos !== "object") {
            throw new Error("Datos inválidos.");
        }

        if (id) {
            const tarea = this.lista.find(t => t.id === id);
            if (!tarea) {
                throw new Error("Tarea no encontrada.");
            }

            if (datos.tarea !== undefined) {
                if (!datos.tarea || datos.tarea.trim() === "") {
                    throw new Error("Texto requerido.");
                }
                tarea.tarea = datos.tarea;
            }
            if (datos.categoria !== undefined) tarea.categoria = datos.categoria;
            if (datos.fecha !== undefined) tarea.fecha = datos.fecha;
            if (datos.hora !== undefined) tarea.hora = datos.hora;
            if (datos.estado !== undefined) tarea.estado = datos.estado;

            this.#guardar();
            return { tarea, accion: "editada" };
        }

        if (!datos.tarea || datos.tarea.trim() === "") {
            throw new Error("Texto requerido.");
        }

        const nueva = new Tarea(
            datos.tarea,
            undefined,
            datos.categoria,
            datos.fecha || null,
            datos.hora || null
        );

        this.lista.push(nueva);
        this.#guardar();
        return { tarea: nueva, accion: "creada" };
    }

    obtenerTareas() {
        this.#cargar();
        return [...this.lista].reverse();
    }

    obtenerTareaPorId(id) {
        const tarea = this.lista.find(t => t.id === id);
        if (!tarea) {
            throw new Error("Tarea no encontrada.");
        }
        return tarea;
    }

    finalizarTarea(id) {
        const tarea = this.obtenerTareaPorId(id);
        tarea.cambiarEstado();
        this.#guardar();
        return tarea;
    }

    eliminarTarea(id) {
        const indice = this.lista.findIndex(t => t.id === id);
        if (indice === -1) {
            throw new Error("ID inexistente.");
        }

        this.lista.splice(indice, 1);
        this.#guardar();
        return true;
    }

    get total() {
        return this.lista.length;
    }

    get pendientes() {
        return this.lista.filter(t => t.estado === 'pendiente').length;
    }

    get finalizadas() {
        return this.lista.filter(t => t.estado === 'completada').length;
    }

    #guardar() {
        try {
            localStorage.setItem("tareas", JSON.stringify(this.lista));
        } catch (error) {
            throw new Error("Error de guardado.");
        }
    }

    #cargar() {
        try {
            const datos = localStorage.getItem("tareas");
            if (datos) {
                const parseadas = JSON.parse(datos);
                this.lista = parseadas.map(t => {
                    const instancia = new Tarea(t.tarea, t.id, t.categoria, t.fecha, t.hora);
                    instancia.estado = t.estado;
                    instancia.fechaCreacion = t.fechaCreacion;
                    return instancia;
                });
            } else {
                this.lista = [];
            }
        } catch (error) {
            this.lista = [];
            throw new Error("Almacenamiento corrupto.");
        }
    }
}

export { GestorTareas };