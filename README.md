<div align="center">
  <img src="./public/banner.jpg" alt="Krevo WMS Banner" width="100%" />

  # Krevo WMS
  **Adiós Excel. Hola control real.** <br/>
  *El cerebro de tu Centro de Distribución.*

  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TanStack Start](https://img.shields.io/badge/TanStack-FF4154?style=for-the-badge&logo=react&logoColor=white)](https://tanstack.com/router/latest)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

<br/>

## 🚀 Visión General

**Krevo** es un moderno Sistema de Gestión de Almacenes (WMS) construido como un SaaS Multi-Tenant. Diseñado para combatir el caos de los centros de distribución latinoamericanos que aún dependen de hojas de cálculo, Krevo centraliza inventarios, recepciones, trazabilidad de lotes (FEFO/FIFO) y métricas en tiempo real en una interfaz hiper-optimizada.

Nuestra filosofía arquitectónica prioriza la **velocidad de operación**. Cero recargas de página, optimización PWA para escáneres móviles en bodega, y una interfaz de alto contraste *(Dark Mode industrial)* para reducir la fatiga visual de los operarios bajo luz fluorescente.

---

## 🏗 Arquitectura Técnica

El frontend está construido sobre tecnologías de vanguardia para garantizar un rendimiento inigualable:

- **Framework Core:** [React 19](https://react.dev/) montado sobre [TanStack Start / Router](https://tanstack.com/router) (Cero Lovable/código generado de terceros, 100% propietario).
- **Build System:** [Vite](https://vitejs.dev/) para empaquetado ultra-rápido y HMR en milisegundos.
- **Estilos & UI:** 
  - [Tailwind CSS v4](https://tailwindcss.com/) (Motor nativo).
  - [Shadcn UI](https://ui.shadcn.com/) / Radix UI para accesibilidad estricta W3C.
  - [Framer Motion](https://www.framer.com/motion/) para micro-interacciones a 60fps.
- **Estado y Validaciones:** 
  - `@tanstack/react-query` para fetching asíncrono.
  - `react-hook-form` + `zod` para validaciones de formulario en tiempo real.

---

## ✨ Características Principales (Features)

### 1. Flujo de Autenticación Premium
* **Onboarding tipo Wizard:** División inteligente de carga cognitiva (Usuario -> Organización -> Términos).
* **Validaciones estrictas:** Feedback en vivo sobre la fortaleza de contraseñas y correos empresariales.

### 2. Dashboard y Operaciones Logísticas
* Tablas de datos rápidas con búsqueda, filtros y paginación.
* Componentes `<AlertDialog>` y protecciones para prevenir la eliminación accidental de SKUs críticos.
* Estados de carga asíncronos en el 100% de las acciones destructivas o lentas.

### 3. Usabilidad & UX Rigurosa
* Soporte para lectores de pantalla en todas las barras de búsqueda (`sr-only` labels).
* Micro-redondeo geométrico calculado (Radio de 4px a 16px) en componentes y *Bento Grids* para un aspecto sobrio y sofisticado.

---

## 📦 Desarrollo Local

Clona el repositorio y levanta tu propio reactor logístico en menos de 2 minutos.

```bash
# 1. Clona el repositorio
git clone https://github.com/TuUsuario/krevo-saas.git

# 2. Entra al directorio
cd krevo-saas

# 3. Instala las dependencias
npm install

# 4. Levanta el servidor de desarrollo
npm run dev
```

> **Nota:** Visita `http://localhost:3000` en tu navegador. El proyecto soporta *hot-reloading*. 

---

## 🛡 Consideraciones de Accesibilidad (A11y)
Este proyecto cumple estrictamente con estándares WCAG:
- Todos los campos de formulario e inputs tienen `<Label>` conectadas.
- Los botones basados únicamente en íconos tienen atributos `aria-label`.
- Paleta de color testeada para proveer ratios de contraste superiores a 7:1 en estado Dark Mode.

---

<div align="center">
  <p>Construido con precisión atómica. ⚛️</p>
</div>
