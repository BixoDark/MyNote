# My Note. — Gestor de Tareas

**My Note.** es una aplicación web interactiva para la gestión de tareas personales y profesionales de forma rápida y sencilla. Desarrollada como proyecto de evaluación para el módulo de Programación Avanzada en JavaScript de Alkemy, la aplicación implementa principios de programación orientada a objetos (POO), manipulación dinámica del DOM, asincronía y persistencia de datos mediante el consumo de APIs externas y almacenamiento local.

---

## 🚀 Características Principales

*   **Gestión de Tareas (CRUD):** Creación, cambio de estado (completar) y eliminación de tareas en tiempo real.
*   **Clasificación por Categorías:** Organización automática de tareas en cuatro secciones visuales independientes basadas en la interfaz HTML:
    *   ⚠️ **Tareas Importantes** (Contenedor destacado a ancho completo).
    *   ⚡ **Tareas Relevantes**.
    *   📝 **Notas**.
    *   🛒 **Compras**.
*   **Persistencia Local:** Sincronización automática de todas las acciones en el navegador utilizando `localStorage`.
*   **Consumo de API Externa:** Recuperación asíncrona de datos de prueba mediante `fetch` en caso de no contar con un almacenamiento previo en el navegador.
*   **Asincronía y Notificaciones:** Simulación de retardo (1 segundo) al agregar tareas y notificaciones en consola tras 2 segundos utilizando temporizadores.
*   **Interactividad Avanzada:** Interfaz enriquecida mediante eventos de teclado (`keyup` para limpiar con la tecla *Escape*) y delegación de eventos para la manipulación dinámica de elementos de Bootstrap 5.

---

## 🛠️ Tecnologías Utilizadas

*   **HTML5 & CSS3:** Estructuración semántica y diseño visual responsivo.
*   **Bootstrap 5 & Bootstrap Icons:** Estilos nativos, rejilla adaptativa y elementos gráficos modernos.
*   **JavaScript Moderno (ES6+):**
    *   Programación Orientada a Objetos (Clases `Tarea` y `GestorTareas`).
    *   Módulos nativos de ES6 (`import` / `export`).
    *   Sintaxis moderna (`const`/`let`, Arrow Functions, Template Literals, Destructuring).
    *   Manejo de asincronía (`async/await`, Promesas y `setTimeout`).
    *   Estructuras de control con manejo de errores robusto (`try/catch`).

---

## 📝 Requerimientos del Proyecto Cumplidos (Módulo #4)

1.  **Orientación a Objetos:** Separación de responsabilidades mediante la modularización de clases de JavaScript (`Tarea` y `GestorTareas`).
2.  **Sintaxis ES6+:** Uso sistemático de variables seguras (`let`/`const`), plantillas de texto, funciones flecha y desestructuración.
3.  **Eventos del DOM:** Formulario de Bootstrap validado mediante eventos de envío (`submit`), control de eventos de teclado (`keyup`) e interacciones dinámicas de botones (`click`).
4.  **Asincronía:** Implementación de retardos y notificaciones de carga simuladas mediante promesas y temporizadores.
5.  **Consumo de APIs:** Integración de peticiones de red asíncronas seguras con control de excepciones a través de bloques `try/catch`.

---

## 🧑‍💻 Autor y Contacto

*   **Autor:** Victor Navarrete
*   **Contacto:** navarreteduranvictor@gmail.com