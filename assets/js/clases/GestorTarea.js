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
            const tarea = this.obtenerTareaPorId(id);

            if ("tarea" in datos) {
                if (!datos.tarea?.trim()) {
                    throw new Error("Texto requerido.");
                }
                tarea.tarea = datos.tarea.trim();
            }

            ["categoria", "fecha", "hora", "estado"].forEach(campo => {
                if (campo in datos) {
                    tarea[campo] = datos[campo];
                }
            });

            this.#guardar();
            return { tarea, accion: "editada" };
        }

        if (!datos.tarea?.trim()) {
            throw new Error("Texto requerido.");
        }

        const nueva = new Tarea(
            datos.tarea.trim(),
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
        return [...this.lista].reverse();
    }

    obtenerTareaPorId(id) {
        const tarea = this.lista.find(tarea => tarea.id === id);

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
        const indice = this.lista.findIndex(tarea => tarea.id === id);

        if (indice < 0) {
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
        return this.lista.filter(({ estado }) => estado === "pendiente").length;
    }

    get finalizadas() {
        return this.lista.filter(({ estado }) => estado === "completada").length;
    }

    #guardar() {
        try {
            localStorage.setItem("tareas", JSON.stringify(this.lista));
        } catch {
            throw new Error("Error de guardado.");
        }
    }

    #cargar() {
        try {
            const datos = JSON.parse(localStorage.getItem("tareas")) || [];

            this.lista = datos.map(({ tarea, id, categoria, fecha, hora, estado, fechaCreacion }) => {
                const instancia = new Tarea(tarea, id, categoria, fecha, hora);
                instancia.estado = estado;
                instancia.fechaCreacion = fechaCreacion;
                return instancia;
            });
        } catch {
            this.lista = [];
            throw new Error("Almacenamiento corrupto.");
        }
    }
}

export { GestorTareas };