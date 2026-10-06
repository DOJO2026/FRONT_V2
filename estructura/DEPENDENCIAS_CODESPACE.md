# Requisitos y Dependencias del Proyecto • GitHub Codespaces

Este documento detalla todas las dependencias del sistema, paquetes de Node.js y herramientas necesarias para provisionar y ejecutar el entorno de desarrollo de **FRONT_V2 (DOJO 2.0)** en un contenedor o **GitHub Codespaces**.

> El archivo estructurado en formato JSON se encuentra disponible en:  
> 👉 [`estructura/dependencias-codespace.json`](./dependencias-codespace.json)

---

## 1. Requisitos de Entorno de Ejecución (Runtime)

| Herramienta / Runtime | Versión Mínima | Versión Recomendada | Notas |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.18.0` | `v22.x LTS` (o `v20.x LTS`) | Requerido por Angular 20 y TypeScript 5.9 |
| **npm** | `>= 10.8.0` | `v11.x` | Gestor de paquetes incluido con Node |
| **Angular CLI** | `^20.3.2` | `@angular/cli@20.3.2` | Opcional globalmente: `npm i -g @angular/cli@20.3.2` |
| **Linux (OS)** | Ubuntu 22.04 / 24.04 LTS | Base default de Codespaces | Entorno estándar de contenedor Dev Container |

---

## 2. Puertos de Red en Codespaces

| Puerto | Protocolo | Servicio | Visibilidad Recomendada |
| :--- | :--- | :--- | :--- |
| **`4200`** | HTTP | Angular Dev Server (`ng serve`) | Privada / Forwarded con navegador automático |

> **Nota para Codespaces**: Para acceder al servidor de desarrollo desde el túnel web de GitHub Codespaces, inicia la aplicación escuchando en todas las interfaces:
> ```bash
> npm start -- --host 0.0.0.0
> ```

---

## 3. Dependencias de Producción (`dependencies`)

Instaladas mediante `npm install`:

| Paquete | Versión Exacta / Rango | Propósito / Descripción |
| :--- | :--- | :--- |
| `@angular/cdk` | `^20.2.14` | Component Dev Kit (overlays, portales, accesibilidad a11y, drag & drop) |
| `@angular/common` | `^20.3.0` | Directivas básicas, pipes y servicios comunes del framework |
| `@angular/compiler` | `^20.3.0` | Motor de compilación de plantillas de Angular |
| `@angular/core` | `^20.3.0` | Núcleo del framework Angular (Signals reactivos, soporte Zoneless) |
| `@angular/forms` | `^20.3.0` | Manejo de formularios reactivos y validaciones |
| `@angular/platform-browser` | `^20.3.0` | Renderizado y vinculación con el DOM del navegador |
| `@angular/router` | `^20.3.0` | Enrutamiento SPA con rutas hijas, guards y lazy loading |
| `@tailwindcss/postcss` | `^4.3.3` | Plugin PostCSS para Tailwind CSS v4 |
| `postcss` | `^8.5.26` | Procesamiento del canal de estilos CSS |
| `rxjs` | `~7.8.0` | Programación reactiva con Observables y operadores asíncronos |
| `tailwindcss` | `^4.3.3` | Framework de diseño utilitario Tailwind CSS v4 |
| `tslib` | `^2.3.0` | Runtime de funciones helper generadas por TypeScript |

---

## 4. Dependencias de Desarrollo (`devDependencies`)

| Paquete | Versión | Propósito / Descripción |
| :--- | :--- | :--- |
| `@angular/build` | `^20.3.2` | Motor de empaquetado de última generación basado en Vite y esbuild |
| `@angular/cli` | `^20.3.2` | CLI de Angular para desarrollo local, scaffolding y compilación |
| `@angular/compiler-cli` | `^20.3.0` | Compilador AoT integrado con `tsc` |
| `@types/jasmine` | `~5.1.0` | Definición de tipos estáticos para suites Jasmine |
| `jasmine-core` | `~5.9.0` | Framework BDD para ejecución de pruebas unitarias |
| `karma` | `~6.4.0` | Test runner en navegadores |
| `karma-chrome-launcher` | `~3.2.0` | Lanzador de navegador Chrome/Chromium headless para Karma |
| `karma-coverage` | `~2.2.0` | Generación de métricas de cobertura de código (Istanbul) |
| `karma-jasmine` | `~5.1.0` | Integrador entre Karma y Jasmine |
| `karma-jasmine-html-reporter` | `~2.1.0` | Generador de reportes visuales en navegador |
| `typescript` | `~5.9.2` | Compilador oficial del lenguaje TypeScript |

---

## 5. Extensiones recomendadas para VS Code en Codespaces

Si configuras un archivo `.devcontainer/devcontainer.json`, incluye estas extensiones recomendadas:

```json
{
  "customizations": {
    "vscode": {
      "extensions": [
        "angular.ng-template",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint"
      ]
    }
  }
}
```

---

## 6. Comandos de Inicialización Rápida en Codespaces

```bash
# 1. Instalar todas las dependencias
npm install

# 2. Iniciar servidor de desarrollo en Codespaces (accesible en puerto 4200)
npm start -- --host 0.0.0.0

# 3. Compilar para producción (validación de build)
npm run build
```
