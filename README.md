# My Note. — Gestor de Tareas

**My Note.** es una aplicación web interactiva para la gestión de tareas personales y profesionales. Desarrollada como proyecto de evaluación para el módulo de Programación Avanzada en JavaScript de Alkemy, la aplicación implementa principios de programación orientada a objetos (POO), manipulación dinámica del DOM, asincronía y consumo de APIs.

---

## 🚀 Características Principales

*   **Gestión de Tareas (CRUD):** Creación, edición, cambio de estado (completar) y eliminación de tareas en tiempo real.
*   **Clasificación por Categorías:** Organización automática de tareas en cuatro secciones visuales independientes: Importantes, Relevantes, Notas y Compras.
*   **Persistencia y Sincronización:** Almacenamiento local mediante `localStorage` y métodos asíncronos para interactuar con la API externa de JSONPlaceholder (carga inicial y simulación de envío/actualización).
*   **Notificaciones Asíncronas Temporales:** Sistema dinámico de alertas flotantes que informa al usuario sobre las acciones realizadas (crear, editar, eliminar, completar) y desaparece automáticamente de forma limpia tras 3 segundos.
*   **Contador Regresivo Optimizado:** Sistema centralizado mediante un único intervalo que calcula y actualiza en tiempo real el tiempo restante para las tareas que poseen fecha y hora límite.

---

## 🛠️ Tecnologías Utilizadas

*   **HTML5 & CSS3:** Estructuración semántica y diseño visual responsivo mediante el uso de Bootstrap 5 y Bootstrap Icons.
*   **JavaScript Moderno (ES6+):**
    *   Programación Orientada a Objetos (Clases `Tarea` y `GestorTareas`).
    *   Uso estricto de variables seguras (`let`/`const`), template literals y desestructuración.
    *   Asincronía controlada mediante `async/await`, Promesas, `setTimeout` y `setInterval`.
    *   Peticiones de red asíncronas con manejo de errores utilizando `fetch()` y bloques `try/catch`.

---

## 📝 Requerimientos del Proyecto Cumplidos (Módulo #4)

1.  **Orientación a Objetos:** Separación de responsabilidades mediante la modularización de clases e instanciación de objetos.
2.  **Sintaxis ES6+:** Aplicación de let/const, arrow functions, métodos de arreglos y spread operators.
3.  **Eventos del DOM:** Manipulación dinámica de la interfaz utilizando la delegación de eventos (`click`) y respuestas a interacciones del usuario en formularios (`submit`).
4.  **Asincronía:** Implementación de retardos simulados de carga, notificaciones temporizadas y cronómetros regresivos.
5.  **Consumo de APIs:** Carga de datos iniciales mediante JSONPlaceholder e integración de una arquitectura "Local-First" apoyada en `localStorage`.

---

## 🧑‍💻 Autor y Contacto

*   **Autor:** Victor Navarrete
*   **Contacto:** navarreteduranvictor@gmail.com