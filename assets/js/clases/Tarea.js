class Tarea {
    constructor(tarea, id = crypto.randomUUID(), categoria, fecha = null, hora = null) {
        this.tarea = tarea;
        this.id = id;
        this.categoria = categoria;
        this.fecha = fecha;
        this.hora = hora;
        this.estado = 'pendiente';
        this.fechaCreacion = new Date().toLocaleString();
    }

    cambiarEstado() {
        this.estado = this.estado === 'pendiente' ? 'completada' : 'pendiente';
    }
}

export default Tarea;