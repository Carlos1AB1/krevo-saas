# Nuclear WMS

Nuclear WMS es un sistema de gestión de almacén moderno, rápido y construido para la eficiencia.

## 🚀 Checklist de Proyecto (Lighthouse & PWA)

- [x] **Diseño Responsive:** Layout y componentes adaptables a móviles, tablets y desktop.
- [x] **PWA Ready:** Estructura preparada para integrar Vite PWA y manifest.json.
- [x] **Performance (Lighthouse):**
  - [x] Uso de tipografías optimizadas (Inter, JetBrains Mono).
  - [x] Íconos en SVG ligeros (`lucide-react`).
  - [x] Efectos de UI performantes manejados con Tailwind CSS y Framer Motion (`motion`).
  - [x] Animaciones con `will-change` donde aplique para fluidez a 60fps.
- [x] **Accesibilidad:** Uso de colores de alto contraste (diseño oscuro/claro). Componentes Radix UI accesibles por teclado y con soporte para lectores de pantalla.
- [x] **Best Practices:** Estructura de componentes reutilizables (`nuclear-ui`), ruteo seguro con Tanstack Router.
- [x] **SEO:** Rutas públicas con metadata definida (Landing, Precios, Características).

## 🛠 Features Implementadas según el Plan

1. **Tokens de Diseño:** `styles.css` con variables CSS para temas Dark/Light de alto contraste ("Nuclear").
2. **Componentes Base (`nuclear-ui`):** Componentes visuales unificados como `kpi-card`, `section-heading`, `animated-number`, etc.
3. **Página de Aterrizaje:** Inicio, Características, Precios, Nosotros, etc.
4. **Flujo de Autenticación:** Login, Registro, Recuperar Contraseña.
5. **Dashboard:** Vista principal de métricas y acceso rápido a módulos.
6. **Módulos de Sistema:** Inventario (`Stock`, `Productos`) y Operaciones (`Recepciones`, `Picking`, `Despachos`).
7. **PWA Operario:** Vistas optimizadas para escáneres y uso móvil en pantallas pequeñas.

## 📦 Desarrollo Local

Para correr el proyecto localmente:

```bash
npm install
npm run dev
```

El servidor iniciará en el puerto 3000 por defecto.
