const SELECTORES = {
    formulario: '#formTarea',
    texto: '#tareaTexto',
    categoria: '#tipoTarea',
    fecha: '#fechaTarea',
    hora: '#horaTarea',
    botonGuardar: '#formTarea button[type="submit"]',
    contadorTotal: '#contadorTotal',
    contadorPendientes: '#contadorPendientes',
    contadorRealizadas: '#contadorRealizadas'
};
const CATEGORIAS = ['importante', 'relevante', 'nota', 'compra'];

const formatos = {
    fecha: new Intl.DateTimeFormat(navigator.language, { year: 'numeric', month: 'long', day: 'numeric' }),
    hora: new Intl.DateTimeFormat(navigator.language, { hour: 'numeric', minute: 'numeric', hour12: true })
};

const DOM = { bloques: {} };

const formatearFechaHora = (cadena, tipo) => {
    if (!cadena) return '';
    const [a, b, c] = cadena.split(/[-:]/).map(Number);
    return formatos[tipo].format(tipo === 'fecha' ? new Date(a, b - 1, c) : new Date().setHours(a, b, 0, 0));
};

const alternarBloque = (bloque, mostrarLista) => {
    bloque.lista.classList.toggle('d-none', !mostrarLista);
    bloque.vacio.classList.toggle('d-none', mostrarLista);
};

const iterarBloques = (callback) => Object.values(DOM.bloques).forEach(callback);

const crearNodoTarea = (tarea) => {
    const completada = tarea.estado === 'completada';
    const item = document.createElement('li');
    item.className = `list-group-item d-flex justify-content-between align-items-center ${completada ? 'bg-light' : ''}`;

    const tiempo = [formatearFechaHora(tarea.hora, 'hora'), formatearFechaHora(tarea.fecha, 'fecha')]
        .filter(Boolean)
        .join(' - ');

    let dataLimite = '';
    if (tarea.fecha && tarea.hora && !completada) {
        const [anio, mes, dia] = tarea.fecha.split('-');
        const [hora, min] = tarea.hora.split(':');
        const timestampLimite = new Date(anio, mes - 1, dia, hora, min).getTime();
        dataLimite = `data-limite="${timestampLimite}"`;
    }

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
            ${tiempo ? `<small class="text-secondary d-block"><i class="bi bi-clock me-1"></i>${tiempo}</small>` : ''}
            ${dataLimite ? `<span class="badge bg-warning text-dark mt-1 contador-tiempo" ${dataLimite}></span>` : ''}
        </div>
        <div class="d-flex gap-2">${botones}</div>`;

    return item;
};

export const UI = {
    _intervaloGlobal: null,

    inicializarDOM() {
        Object.entries(SELECTORES).forEach(([clave, selector]) => {
            DOM[clave] = document.querySelector(selector);
        });

        const hoy = new Date();
        const fechaLocal = new Date(hoy.getTime() - (hoy.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        DOM.fecha.setAttribute('min', fechaLocal);

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

    validarFormulario(esEdicion = false) {
        DOM.fecha.setCustomValidity('');
        DOM.hora.setCustomValidity('');

        const fecha = DOM.fecha.value;
        const hora = DOM.hora.value;

        if (!esEdicion && fecha) {
            const [anio, mes, dia] = fecha.split('-');

            const h = hora ? parseInt(hora.split(':')[0], 10) : 23;
            const m = hora ? parseInt(hora.split(':')[1], 10) : 59;

            const tiempoSeleccionado = new Date(anio, mes - 1, dia, h, m).getTime();

            if (tiempoSeleccionado < Date.now() - 60000) {
                DOM.fecha.setCustomValidity('Tiempo en el pasado.');
                if (hora) DOM.hora.setCustomValidity('Tiempo en el pasado.');

                this.mostrarNotificacionTemporal("La fecha y hora deben ser futuras.", "danger");

                console.warn("El usuario ingreso una hora inferior a la actual.")
            }
        }

        const esValido = DOM.formulario.checkValidity();
        DOM.formulario.classList.toggle('was-validated', true);
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
        this.iniciarContadoresRegresivos();
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
    },

    actualizarContadores(total, pendientes, realizadas) {
        if (DOM.contadorTotal) DOM.contadorTotal.textContent = total;
        if (DOM.contadorPendientes) DOM.contadorPendientes.textContent = pendientes;
        if (DOM.contadorRealizadas) DOM.contadorRealizadas.textContent = realizadas;
    },

    mostrarNotificacionTemporal(mensaje, tipo = 'success') {
        const icono = { success: 'check-circle', danger: 'trash', info: 'arrow-counterclockwise' }[tipo] || 'info-circle';

        if (!DOM.notificaciones) {
            DOM.notificaciones = document.createElement('div');
            DOM.notificaciones.className = 'position-fixed bottom-0 end-0 p-3 d-flex flex-column gap-2 z-3';
            document.body.appendChild(DOM.notificaciones);
        }

        const notificacion = document.createElement('div');
        notificacion.className = `alert alert-${tipo} shadow mb-0 fade show`;
        notificacion.innerHTML = `<i class="bi bi-${icono} me-2"></i>${mensaje}`;

        DOM.notificaciones.appendChild(notificacion);

        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => {
                notificacion.remove();
                if (!DOM.notificaciones.childElementCount) {
                    DOM.notificaciones.remove();
                    DOM.notificaciones = null;
                }
            }, 150);
        }, 3000);
    },

    iniciarContadoresRegresivos() {
        if (this._intervaloGlobal) clearInterval(this._intervaloGlobal);

        this._intervaloGlobal = setInterval(() => {
            const ahora = Date.now();
            const nodosContador = document.querySelectorAll('.contador-tiempo[data-limite]');

            nodosContador.forEach(nodo => {
                const limite = parseInt(nodo.dataset.limite, 10);
                const diferencia = limite - ahora;

                if (diferencia <= 0) {
                    nodo.textContent = "¡Tiempo agotado!";
                    nodo.className = "badge bg-danger text-white mt-1 contador-tiempo";
                    delete nodo.dataset.limite;
                } else {
                    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
                    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
                    const min = Math.floor((diferencia / 1000 / 60) % 60);
                    const seg = Math.floor((diferencia / 1000) % 60);

                    nodo.textContent = `Quedan: ${dias}d ${horas}h ${min}m ${seg}s`;
                }
            });
        }, 1000);
    }
};