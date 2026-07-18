import Tarea from "./Tarea.js";

const API_URL = "https://jsonplaceholder.typicode.com/todos";

class GestorTareas {
    constructor() {
        this.lista = [];
        this.#cargarLocal();
    }

    async guardar(id, datos) {
        this.#validarDatos(datos);

        let tarea;
        let accion;

        if (id) {
            tarea = this.obtenerTareaPorId(id);
            this.#actualizarCampos(tarea, datos);
            accion = "editada";
            await this.guardarEnAPI(tarea, "PUT");
        } else {
            tarea = new Tarea(
                datos.tarea.trim(),
                undefined,
                datos.categoria,
                datos.fecha || null,
                datos.hora || null
            );
            this.lista.push(tarea);
            accion = "creada";
            await this.guardarEnAPI(tarea, "POST");
        }

        this.#guardarLocal();
        return { tarea, accion };
    }

    obtenerTareas() {
        return [...this.lista].reverse();
    }

    obtenerTareaPorId(id) {
        const tarea = this.lista.find(t => t.id === id);
        if (!tarea) throw new Error("Tarea no encontrada.");
        return tarea;
    }

    async finalizarTarea(id) {
        const tarea = this.obtenerTareaPorId(id);
        tarea.cambiarEstado();
        this.#guardarLocal();
        await this.guardarEnAPI(tarea, "PATCH");
        return tarea;
    }

    async eliminarTarea(id) {
        const indice = this.lista.findIndex(t => t.id === id);
        if (indice < 0) throw new Error("ID inexistente.");

        const idEliminado = this.lista[indice].id;
        this.lista.splice(indice, 1);
        this.#guardarLocal();

        await fetch(`${API_URL}/${typeof idEliminado === 'number' ? idEliminado : 1}`, { method: 'DELETE' });

        return true;
    }


    get total() { return this.lista.length; }
    get pendientes() { return this.#contarPorEstado("pendiente"); }
    get finalizadas() { return this.#contarPorEstado("completada"); }

    #contarPorEstado(estadoBuscado) {
        return this.lista.filter(({ estado }) => estado === estadoBuscado).length;
    }


    async obtenerDatosInicialesAPI(limite = 5) {
        try {
            const respuesta = await fetch(`${API_URL}?_limit=${limite}`);
            if (!respuesta.ok) throw new Error("Error HTTP: " + respuesta.status);

            const tareasAPI = await respuesta.json();

            const nuevasTareas = tareasAPI.map(t => {
                const nueva = new Tarea(t.title);
                nueva.id = t.id;
                nueva.estado = t.completed ? "completada" : "pendiente";
                return nueva;
            });

            if (this.lista.length === 0) {
                this.lista = nuevasTareas;
                this.#guardarLocal();
            }

            return nuevasTareas;
        } catch (error) {
            console.error("Fallo al obtener datos de la API:", error);
            throw error;
        }
    }

    async guardarEnAPI(tarea, metodo) {
        try {
            const apiId = typeof tarea.id === 'number' ? tarea.id : 1;
            const url = metodo === "POST" ? API_URL : `${API_URL}/${apiId}`;

            const payload = {
                title: tarea.tarea,
                completed: tarea.estado === "completada",
                userId: 1
            };

            const respuesta = await fetch(url, {
                method: metodo,
                body: JSON.stringify(payload),
                headers: { 'Content-type': 'application/json; charset=UTF-8' },
            });

            if (!respuesta.ok) throw new Error(`Fallo en API: ${respuesta.status}`);
            return await respuesta.json();

        } catch (error) {
            console.error(`Error al enviar a API [${metodo}]:`, error);
        }
    }

    async recuperarTareasAPI() {
        try {
            const respuesta = await fetch(`${API_URL}?_limit=10`);
            const tareasAPI = await respuesta.json();

            this.lista = tareasAPI.map(t => {
                const nueva = new Tarea(t.title);
                nueva.id = t.id;
                nueva.estado = t.completed ? "completada" : "pendiente";
                return nueva;
            });

            this.#guardarLocal();
            return this.lista;
        } catch (error) {
            console.error("Fallo al recuperar tareas de la API:", error);
            throw error;
        }
    }


    #validarDatos(datos) {
        if (!datos || typeof datos !== "object") throw new Error("Datos inválidos.");
        if ("tarea" in datos && !datos.tarea?.trim()) throw new Error("Texto requerido.");
    }

    #actualizarCampos(tarea, datos) {
        const campos = ["categoria", "fecha", "hora", "estado"];
        if ("tarea" in datos) tarea.tarea = datos.tarea.trim();

        campos.forEach(campo => {
            if (campo in datos) tarea[campo] = datos[campo];
        });
    }

    #guardarLocal() {
        try {
            localStorage.setItem("tareas", JSON.stringify(this.lista));
        } catch {
            throw new Error("Error de guardado local.");
        }
    }

    #cargarLocal() {
        try {
            const datos = JSON.parse(localStorage.getItem("tareas")) || [];
            this.lista = datos.map(d => {
                const instancia = new Tarea(d.tarea, d.id, d.categoria, d.fecha, d.hora);
                instancia.estado = d.estado;
                instancia.fechaCreacion = d.fechaCreacion;
                return instancia;
            });
        } catch {
            this.lista = [];
            throw new Error("Almacenamiento corrupto.");
        }
    }
}

export { GestorTareas };