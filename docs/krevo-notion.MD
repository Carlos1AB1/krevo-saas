---

## Eje Problémico

Los centros de distribución en la región enfrentan **ineficiencias críticas** debido a la gestión manual, lo que resulta en:

- Falta de trazabilidad
- Errores en la rotación de productos
- Costos elevados por descontrol de existencias

Bajo el modelo de formación dual, los estudiantes de Ingeniería Industrial actúan como **Product Owners**, asegurando que la herramienta tecnológica resuelva problemas reales de almacenamiento, recepción y despacho.

---

## ¿Qué vamos a desarrollar?

Un sistema para la gestión de un Centro de Distribución (CEDI), que incluye los siguientes requisitos funcionales y no funcionales:

## I. Requerimientos Funcionales (RF) - Dominio del Negocio

Los RF se estructuran bajo un modelo de Monolito Modular, divididos por los dominios exactos del SaaS.

- Módulo de Identidad y Acceso (IAM - Identity and Access Management)
    - [RF-IAM-01] Aislamiento Multi-Tenant: El sistema debe asignar un identificador único (tenant_id) a cada empresa registrada. Absolutamente todas las consultas a la base de datos deben filtrar por este ID para garantizar que la Empresa A jamás acceda a los datos de la Empresa B.
    - [RF-IAM-02] Autenticación JWT: El sistema debe permitir el inicio de sesión de usuarios mediante credenciales (correo/contraseña), retornando un JSON Web Token (JWT) con un tiempo de expiración (ej. 8 horas) para mantener la sesión segura.
    - [RF-IAM-03] Recuperación de Credenciales: El sistema debe enviar un enlace temporal cifrado al correo electrónico del usuario para el restablecimiento de su contraseña en caso de olvido.
    - [RF-IAM-04] Control de Acceso Basado en Roles (RBAC): El sistema debe soportar roles predefinidos: SuperAdmin (Dueño del SaaS), Administrador Tenant (Gerente de la empresa), Supervisor (Jefe de Producción/Bodega) y Operario. (parametrizacion de roles y permisos, prioridad baja)
    - [RF-IAM-05] Trazabilidad de Auditoría: El sistema debe registrar un log inmutable de quién hizo qué y cuándo (ej. "El Operario X modificó el inventario Y en la fecha Z").
- Módulo de Suscripciones y Facturación SaaS (Billing)
    - [RF-BIL-01] Gestión de Planes: El sistema debe permitir al SuperAdmin configurar planes de suscripción (ej. Básico, Pro, Enterprise) limitando características como el número de usuarios, número de bodegas o volumen de transacciones mensuales.
    - [RF-BIL-02] Integración de Pasarela de Pagos: El sistema debe integrarse vía API con pasarelas de pago (ej. ePayco, Wompi) para procesar cobros recurrentes en Pesos Colombianos (COP) mediante tarjetas de crédito o PSE.
    - [RF-BIL-03] Bloqueo por Morosidad: El sistema debe suspender automáticamente el acceso de escritura (congelar la cuenta a modo "solo lectura") a un Tenant si la pasarela de pagos reporta un rechazo en la renovación de la suscripción.
- Módulo de Configuración del CEDI (Core Logístico)
    - [RF-COR-01] Parametrización Espacial: El Administrador Tenant debe poder crear múltiples bodegas y subdividirlas jerárquicamente en Zonas, Pasillos, Estantes y Niveles (mannejar el tipo espacial, en zonas, racks, niveles o pasillos)
    - [RF-COR-02] Gestión de Unidades de Medida: El sistema debe permitir configurar unidades de conversión (ej. 1 Caja = 6 Unidades de 50g), crucial para productos alimenticios (agregar uso de estibas x cajas)
    - [RF-COR-03] Catálogo Maestro de Artículos: Permite registrar SKUs (Stock Keeping Units) categorizados por tipo: Materia Prima, Insumos (tapas, envases) y Producto Terminado. (posible codigo de barras)
    - [RF-COR-04] Parametrización de Tiempos y Costos: El catálogo de artículos debe incluir campos obligatorios para el cálculo logístico: Costo de hacer un pedido o producccion de ahcer ese pedido (S), Costo de mantener el inventario (H), y Tiempo de entrega del proveedor (Lead Time en días).
- Módulo de Gestión de Inventarios (WMS - Warehouse Management)
    - [RF-INV-01] Control de Lotes y Trazabilidad: Todo ingreso de mercancía debe exigir un número de lote y fecha de caducidad.
    - [RF-INV-02] Kárdex Digital: El sistema debe generar un historial de movimientos detallado (entradas, salidas, traslados y ajustes) por cada producto, reflejando el saldo anterior y el saldo actual.
    - [RF-INV-03] Políticas FIFO/FEFO: Al momento de un despacho o traslado, el sistema debe bloquear o alertar si el operario intenta mover un producto ignorando la regla de "Primero en Expirar, Primero en Salir" (FEFO).
    - [RF-INV-04] Alertas de Stock Automatizadas (ACTUALIZADO): El sistema no usará un "stock mínimo" manual, sino que calculará dinámicamente el Punto de Reorden (ROP) basándose en el tiempo de entrega del proveedor (Lead Time) y la demanda promedio. agregar alertas stock, stock minimo de productos.
    - [RF-INV-05] Cálculo ABC Dinámico: El sistema debe recalcular mensualmente la clasificación A, B o C de los productos basándose en la frecuencia de salida y el valor acumulado. (anual o semestral)
    - [RF-INV-06] Modelos de Reposición (Modelo Q y Modelo P): El sistema debe permitir configurar cada SKU bajo un modelo de revisión continua (Cantidad Fija de Pedido - Modelo Q) o revisión periódica (Periodo Fijo - Modelo P), calculando automáticamente la Cantidad Óptima de Pedido (EOQ) según el historial de salidas.
    - [RF-INV-07] Cálculo de Inventario de Seguridad: El sistema debe calcular el stock de seguridad matemático basándose en la desviación estándar de la demanda y el nivel de servicio logístico (Z) parametrizado por la empresa. (anual)
    - [RF-INV-08] Diferenciación Insumos vs. Producto Terminado: El sistema aplicará políticas de inventario distintas; los Insumos (materiales de empaque, azúcar) se gestionarán bajo modelos probabilísticos (Q/P), mientras que el Producto Terminado (Arequipe) se gestionará bajo la política de rotación FEFO.
- Módulo de Operaciones (Inbound / Outbound)
    - [RF-OPE-01] Recepción de Mercancía (Inbound): El sistema debe permitir el ingreso de ítems validando contra un documento soporte (Remisión o Factura del proveedor).
    - [RF-OPE-02] Solicitudes de Traslado (Pre-alistamiento): El sistema debe permitir a Producción generar "Órdenes de Requisición o traslado". Los insumos solicitados quedarán en estado "Reservado" para evitar que otro proceso los tome.
    - [RF-OPE-03] Confirmación de Picking: El Operario debe poder confirmar en el sistema que ha recolectado los ítems de la orden de traslado. (notificar o dar respuesta de la solicitud, ejemplo; si estan los productos disponibles)
    - [RF-OPE-04] Aprobación y Despacho: El Jefe de Bodega aprueba la salida de los ítems de la Bodega origen y se confirma su entrada en la Bodega destino.
- Módulo de Inteligencia de Negocio y Reportes (BI)
    - [RF-BI-01] Dashboard Gerencial: Visualización gráfica en tiempo real de los KPI operativos: Índice de Rotación, Nivel de Servicio y Ocupación del Almacé, rendimientos de las ventas, (dias, semanas, meses)
    - [RF-BI-02] Exportación de Datos: Capacidad de exportar reportes de kárdex, inventario valorizado y usuarios activos en formatos estandarizados (CSV, Excel y PDF).
    - [RF-BI-03] Matriz y Gráfico de Pareto (Análisis ABC): El dashboard debe graficar la curva de Pareto (80/20) para clasificar visualmente el catálogo, mostrando qué productos representan el mayor valor inmovilizado en el CEDI.

## II. Requerimientos No Funcionales (RNF) - Arquitectura y Calidad (ISO 25010)

Justificación sobre la elección tecnológica y mas (NestJS, Next.js, PostgreSQL) 

- Arquitectura y Mantenibilidad
    - [RNF-ARQ-01] Patrón de Diseño: El Backend debe construirse utilizando Clean Architecture en NestJS, separando la lógica de negocio de la infraestructura (controladores HTTP y repositorios de base de datos).
    - [RNF-ARQ-02] Tipado Estricto: Todo el código (Frontend y Backend) debe estar desarrollado en TypeScript para minimizar errores en tiempo de ejecución y documentar implícitamente los contratos de las APIs.
    - [RNF-ARQ-03] Escalabilidad de CI/CD: El repositorio debe estar preparado para Integración Continua, permitiendo usar flujos automatizados de revisión de código para mantener la calidad y evitar deuda técnica.
- Seguridad (Mitigación OWASP)
    - [RNF-SEG-01] Protección de Endpoints: Todas las rutas de la API (excepto el login y los webhooks de la pasarela de pagos) deben estar protegidas por JWT.
    - [RNF-SEG-02] Encriptación: Las contraseñas en la base de datos deben almacenarse cifradas mediante algoritmos de hash fuertes (ej. bcrypt con salt dinámico).
    - [RNF-SEG-03] Prevención de Inyecciones: Se debe utilizar un ORM (como Prisma) para interactuar con PostgreSQL, previniendo ataques de inyección SQL mediante la parametrización automática de consultas.
    - [RNF-SEG-04] Configuración CORS: El servidor Backend debe implementar políticas CORS (Cross-Origin Resource Sharing) estrictas, aceptando peticiones únicamente desde los dominios autorizados del Frontend.
- Fiabilidad e Integridad de Datos
    - [RNF-FIB-01] Transaccionalidad ACID: Todas las operaciones que modifiquen el inventario (ej. mover de Bodega A hacia Bodega B) deben ejecutarse en un bloque transaccional. Si ocurre un fallo en el servidor o la red a mitad del proceso, se debe ejecutar un rollback completo (deshacer los cambios).
    - [RNF-FIB-02] Integridad Referencial: La base de datos debe impedir la eliminación de registros "padre" (ej. Un Producto o una Bodega) si existen movimientos históricos asociados a ellos, utilizando restricciones de llaves foráneas (RESTRICT).
- Rendimiento y Usabilidad
    - [RNF-REN-01] Tiempo de Respuesta: Las consultas API relacionadas con lecturas de inventario deben tener un tiempo de respuesta menor a 500 milisegundos en condiciones normales de red.
    - [RNF-REN-02] Eventos en Tiempo Real: Las actualizaciones críticas en el Dashboard gerencial se transmitirán mediante WebSockets (ej. [Socket.io](http://Socket.io)) para evitar el polling excesivo a la base de datos.
    - [RNF-USA-01] Interfaz Mobile-First para Operarios: Las pantallas correspondientes a la confirmación de traslados y picking deben estar diseñadas bajo un enfoque móvil, permitiendo su uso fluido en tablets o smartphones industriales dentro de la bodega.

---

## Stack Tecnológico

<aside>

**Lenguaje:** TypeScript

</aside>

<aside>

**Frontend:** Next.js

</aside>

<aside>

**Backend:** NestJS

</aside>

<aside>

**Base de datos:** PostgreSQL

</aside>

---

## 👥 Equipo de Trabajo

| **Integrante** | **Rol principal** | **Área** |
| --- | --- | --- |
| Carlos Arturo Barón | Desarrollador Frontend | Next.js / UI |
| Sebastián Ordóñez | Desarrollador Frontend | Next.js / UI |
| Jerónimo Rodríguez | Desarrollador Backend | NestJS / API |
| Jerónimo Vallejo | Desarrollador Backend | NestJS / API |

<aside>

**Responsabilidades compartidas:** Documentación, Base de datos (PostgreSQL) y Lista de Entregables.

</aside>

---

## 🗓️ Cronograma de Entregas

| **Fase** | **Fecha** | **Entregable** | **Peso** |
| --- | --- | --- | --- |
| **1ª Entrega** — Análisis | 15 mayo 2026 |  | 28.5% |
| **2ª Entrega** — Diseño y Validación | 29 mayo 2026 |  | 28.5% |
| **3ª Entrega** — Integración y UAT | 12 junio 2026 |  | 21.5% |
| **Sustentación Final** | 19 junio 2026 |  | 21.5% |

---

## ⚠️ Aspectos Éticos y Disciplinarios

<aside>

- No se aceptan entregas posteriores a la fecha acordada (se califica **cero**).
- Entregas virtuales hasta las **6:00 p.m.** del día definido, en formato **PDF**, a cada docente.
- Normas **IEEE** para referenciación bibliográfica.
- La violación de derechos de autor se califica con **cero**.
</aside>