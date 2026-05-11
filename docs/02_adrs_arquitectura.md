# Registros de Decisiones Arquitectónicas (ADRs)
**Proyecto:** Krevo SaaS - Warehouse Management System (WMS)
**Fase:** Corte 1 (Análisis y Arquitectura Base)

Este documento contiene las decisiones difíciles de cambiar tomadas por el equipo de arquitectura para el sistema **Krevo WMS SaaS**. Cada registro documenta la justificación técnica, las restricciones del proyecto y un balance honesto de los beneficios y sacrificios (*trade-offs*) asumidos.

---

## Índice de Decisiones Arquitectónicas (ADRs)
1. [ADR-001: Usar una Arquitectura de Backend como Monolito Modular con NestJS](#adr-001-usar-una-arquitectura-de-backend-como-monolito-modular-con-nestjs)
2. [ADR-002: Implementar Base de Datos Relacional Central con PostgreSQL y Transaccionalidad ACID](#adr-002-implementar-base-de-datos-relacional-central-con-postgresql-y-transaccionalidad-acid)
3. [ADR-003: Adoptar Aislamiento Multi-Tenant Lógico mediante Columna Discriminadora (`tenant_id`)](#adr-003-adoptar-aislamiento-multi-tenant-logico-mediante-columna-discriminadora-tenant_id)
4. [ADR-004: Implementar TypeScript como Lenguaje Único y Estricto en Todo el Stack](#adr-004-implementar-typescript-como-lenguaje-unico-y-estricto-en-todo-el-stack)
5. [ADR-005: Adoptar un Diseño de Interfaz Mobile-First para Pantallas Operativas de Bodega](#adr-005-adoptar-un-diseno-de-interfaz-mobile-first-para-pantallas-operativas-de-bodega)

---

### ADR-001: Usar una Arquitectura de Backend como Monolito Modular con NestJS

*   **Estado:** Aprobado
*   **Fecha:** 2026-05-10

#### 1. Contexto y Restricciones
El proyecto **Krevo WMS** es un sistema SaaS diseñado para gestionar Centros de Distribución (CEDI). Nos enfrentamos a restricciones severas:
*   **Tiempo de entrega:** 6 semanas en total para tener un sistema validado y en producción.
*   **Capacidad del equipo:** Un equipo de 4 personas, de los cuales solo 2 están dedicados exclusivamente al backend (Jerónimo Rodríguez y Jerónimo Vallejo).
*   **Complejidad del dominio:** Múltiples módulos lógicos (Autenticación/IAM, Inventario/WMS, Operaciones Inbound/Outbound, Facturación, Dashboard/BI) que deben interactuar constantemente entre sí.

Una arquitectura de microservicios requeriría desplegar, orquestar, comunicar (gRPC/RabbitMQ) e integrar múltiples repositorios, lo cual consumiría más del 40% de nuestro cronograma solo en tareas de infraestructura.

#### 2. Decisión y Justificación
Decidimos implementar un **Monolito Modular** utilizando el framework NestJS. 
*   **¿Por qué esta opción?** NestJS nos permite estructurar el backend en módulos lógicos independientes y bien delimitados (folders de modulo con controladores, servicios y repositorios propios). Los límites de los módulos están claramente definidos de modo que, si el día de mañana se requiere migrar un módulo a un microservicio independiente (por ejemplo, el módulo de cálculo ABC de Inventarios debido a una alta carga computacional), la extracción se puede hacer con un mínimo esfuerzo físico de refactorización.
*   **Trade-off (Sacrificio Consciente):** Sacrificamos el escalamiento independiente de cada bloque funcional. Si el módulo de Reportes consume demasiada memoria debido a consultas pesadas, todo el servidor monolítico se verá afectado. Sin embargo, priorizamos la velocidad de entrega, la simplicidad de despliegue en un único servidor y la facilidad de refactorización interna.

#### 3. Consecuencias
*   **Impacto Positivo (+):**
    *   **Velocidad de desarrollo:** El equipo backend trabaja en un único repositorio con un flujo de CI/CD extremadamente simple.
    *   **Simplicidad de integración:** No hay latencia de red en llamadas inter-modulares, ni se requiere coordinar sistemas de mensajería asíncrona distribuidos para la consistencia eventual.
    *   **Bajo costo de infraestructura:** Se requiere un solo contenedor de aplicación en la nube para ejecutar toda la lógica de negocio.
*   **Impacto Negativo Inevitable (-):**
    *   **Despliegue unificado:** Cualquier actualización menor en el módulo de facturación requiere reiniciar todo el monolito, afectando temporalmente el acceso a los operarios en bodega.
    *   **Riesgo de acoplamiento accidental:** Si los desarrolladores no respetan estrictamente la Clean Architecture, un módulo podría importar clases internas de otro de forma directa en lugar de usar interfaces o servicios exportados, rompiendo la modularidad.

---

### ADR-002: Implementar Base de Datos Relacional Central con PostgreSQL y Transaccionalidad ACID

*   **Estado:** Aprobado
*   **Fecha:** 2026-05-10

#### 1. Contexto y Restricciones
Un WMS gestiona operaciones del mundo real en las cuales la precisión de los datos es de vida o muerte para el negocio. Por ejemplo:
*   Si un operario confirma el picking de un lote de materias primas (ej. azúcar para producción), ese stock físico debe bloquearse inmediatamente.
*   Si se realiza un traslado del Pasillo A al Pasillo B, la resta de la ubicación origen y la suma en el destino deben ocurrir simultáneamente.
*   No podemos tolerar la "consistencia eventual" ni registros duplicados o huérfanos.

#### 2. Decisión y Justificación
Se elige **PostgreSQL** como motor de base de datos relacional centralizado, interactuando a través del ORM Prisma.
*   **¿Por qué esta opción?** PostgreSQL ofrece soporte nativo avanzado para transacciones ACID estrictas y restricciones de integridad referencial complejas (como cláusulas `RESTRICT` e índices únicos multivariable). Esto nos garantiza que, ante un fallo del servidor o una caída de red durante un proceso de traslado de stock, el sistema ejecutará un *rollback* completo, impidiendo desajustes entre el stock físico del CEDI y el saldo digital del Kárdex.
*   **Trade-off (Sacrificio Consciente):** Sacrificamos la alta velocidad de escritura que proveen bases de datos NoSQL (como MongoDB o DynamoDB) y su flexibilidad para esquemas dinámicos. En su lugar, asumimos el costo de mantener un esquema relacional estricto con migraciones de datos programadas.

#### 3. Consecuencias
*   **Impacto Positivo (+):**
    *   **Integridad de inventario garantizada:** Cero posibilidad de que aparezca stock duplicado o desaparezcan registros de movimientos debido a fallos intermedios.
    *   **Integridad referencial inmutable:** Las restricciones de base de datos impiden borrar un SKU o una Bodega si existen movimientos de kárdex históricos referenciándolos.
*   **Impacto Negativo Inevitable (-):**
    *   **Bloqueos de tablas (Locking):** En momentos de altísima concurrencia (ej. inventario general anual), las transacciones concurrentes sobre los mismos registros de stock pueden generar bloqueos temporales que aumenten el tiempo de respuesta.
    *   **Complejidad en migraciones:** Cualquier cambio estructural en el catálogo maestro requiere generar y aplicar un archivo de migración de base de datos (`prisma migrate`), lo que demanda cuidado extremo en producción.

---

### ADR-003: Adoptar Aislamiento Multi-Tenant Lógico mediante Columna Discriminadora (`tenant_id`)

*   **Estado:** Aprobado
*   **Fecha:** 2026-05-10

#### 1. Contexto y Restricciones
**Krevo** nace bajo un modelo de negocio SaaS (Software as a Service) multi-empresa. Múltiples empresas logísticas de la región usarán la misma plataforma tecnológica. El aislamiento de los datos es el requisito de seguridad más crítico:
*   La Empresa A (competidora directa de la Empresa B) jamás debe poder consultar, inferir o modificar el stock, los costos, los proveedores o los operarios de la Empresa B.
*   **Restricciones de costos y tiempos:** Crear una base de datos física independiente por cada cliente (Database-per-tenant) o esquemas separados en la misma base de datos (Schema-per-tenant) dispara los costos de infraestructura en la nube y añade alta complejidad al backend para gestionar pools de conexiones dinámicos en un equipo de solo 4 personas en 6 semanas.

#### 2. Decisión y Justificación
Implementar un esquema de **Base de Datos Compartida con Aislamiento Lógico** mediante la columna discriminadora `tenant_id` en absolutamente todas las tablas del sistema que pertenezcan a la información del cliente.
*   **¿Por qué esta opción?** Permite mantener una sola base de datos física PostgreSQL, abaratando dramáticamente los costos de operación y simplificando el mantenimiento de índices, respaldos y despliegues. El aislamiento se garantiza a nivel de software mediante un middleware global en el backend (NestJS) que extrae el `tenant_id` del token JWT del usuario autenticado e inyecta obligatoriamente este identificador en todas las consultas y escrituras del ORM Prisma.
*   **Trade-off (Sacrificio Consciente):** Se asume el riesgo de que un error en el código de una consulta personalizada omita el filtro de `tenant_id` y exponga datos trans-tenant. Esto exige que la seguridad lógica sea un elemento prioritario a auditar mediante pruebas automatizadas y revisiones de código estrictas.

#### 3. Consecuencias
*   **Impacto Positivo (+):**
    *   **Bajo costo operativo:** Un único servidor PostgreSQL de bajo costo puede alojar a decenas de clientes en la fase inicial del SaaS.
    *   **Facilidad en actualizaciones:** Una única migración de base de datos actualiza el esquema para todos los clientes en un solo comando.
    *   **Alta velocidad de aprovisionamiento:** Crear un nuevo cliente (tenant) solo requiere insertar un registro en la tabla `Tenants`, sin necesidad de aprovisionar infraestructura en la nube en caliente.
*   **Impacto Negativo Inevitable (-):**
    *   **Efecto "Vecino Ruidoso" (Noisy Neighbor):** Si un tenant ejecuta reportes de Pareto masivos e ineficientes que saturen la CPU de la base de datos, el rendimiento se degradará para todos los demás clientes del SaaS.
    *   **Responsabilidad absoluta en el código:** La seguridad lógica del aislamiento depende del backend. No hay barreras físicas a nivel de red o servidor que impidan la fuga de datos si un programador comete un error grave en una consulta.

---

### ADR-004: Implementar TypeScript como Lenguaje Único y Estricto en Todo el Stack

*   **Estado:** Aprobado
*   **Fecha:** 2026-05-10

#### 1. Contexto y Restricciones
Un equipo de 4 personas debe programar la lógica matemática del WMS (Modelos de reposición Q y P probabilísticos, análisis ABC, cálculo de stock de seguridad, integraciones de pasarelas de pago) en un lapso de 6 semanas.
Si los desarrolladores de Frontend y Backend utilizan lenguajes o paradigmas diferentes (por ejemplo, Python en backend y JavaScript plano en frontend), el "costo de contexto" al cambiar de tareas de un lado a otro y la dificultad de unificar contratos de API ralentizarían críticamente el desarrollo y propiciarían bugs de tipado en tiempo de ejecución.

#### 2. Decisión y Justificación
Adoptar **TypeScript** de manera exclusiva y obligatoria, tanto en la capa cliente (Next.js/React) como en la capa servidor (NestJS).
*   **¿Por qué esta opción?** Al estandarizar el stack tecnológico en TypeScript, se habilita el uso de interfaces de tipos compartidas. El backend define los esquemas de entrada/salida (DTOs) y el frontend los consume directamente, garantizando la consistencia del contrato de las APIs desde el primer día de codificación. El compilador detecta errores de tipado o cambios en la API en tiempo de desarrollo, reduciendo la necesidad de depuración manual.
*   **Trade-off (Sacrificio Consciente):** Sacrificamos la agilidad inicial y la velocidad que ofrece la sintaxis suelta de JavaScript plano. Definir interfaces, tipos estrictos y genéricos requiere más líneas de código iniciales y disciplina del equipo, pero evita la deuda técnica temprana.

#### 3. Consecuencias
*   **Impacto Positivo (+):**
    *   **Detección temprana de errores:** El 90% de los errores comunes de tipado (ej. tratar de pasar un String a una función de cálculo de stock de seguridad que requiere un Float) se resuelven en el editor de código antes de compilar.
    *   **Sinergia de equipo:** Los 4 miembros del equipo pueden alternarse entre tareas de UI y APIs de backend de manera fluida al compartir el mismo lenguaje.
    *   **Auto-documentación implícita:** Los tipos e interfaces actúan como contratos vivientes de las funcionalidades del negocio logístico.
*   **Impacto Negativo Inevitable (-):**
    *   **Curva de aprendizaje estricta:** Requiere configurar el compilador con la opción `"strict": true`, lo que obliga a resolver alertas complejas de tipos, ralentizando ligeramente la velocidad de los desarrolladores menos familiarizados con TypeScript avanzado.

---

### ADR-005: Adoptar un Diseño de Interfaz Mobile-First para Pantallas Operativas de Bodega

*   **Estado:** Aprobado
*   **Fecha:** 2026-05-10

#### 1. Contexto y Restricciones
Los usuarios de un WMS se dividen en roles estratégicos (Administrador, Jefe de Almacén) y operativos (Operador de Recepción, Operador de Despacho). 
*   Los operadores de recepción y despacho no trabajan sentados frente a un computador de escritorio. Se desplazan físicamente por el CEDI, cargando cajas, subiendo estibas y escaneando códigos de barra.
*   Para realizar confirmación de picking u órdenes de traslado, dependen de tablets industriales o teléfonos inteligentes (smartphones rugged) de pantalla pequeña y uso con una sola mano.
*   Si diseñamos una interfaz orientada exclusivamente a pantallas grandes de escritorio, la plataforma será inutilizable en el suelo de la bodega, frustrando el modelo dual y los objetivos de los *Product Owners*.

#### 2. Decisión y Justificación
Se adopta un enfoque de diseño **Mobile-First** con CSS Vanilla responsive para las vistas que consumen los operadores de recepción y despacho.
*   **¿Por qué esta opción?** Al diseñar mobile-first, priorizamos el uso de botones táctiles de gran tamaño, flujos secuenciales simplificados de un solo paso a la vez, fuentes de alta legibilidad en entornos oscuros de bodega, y optimización de carga de imágenes para redes inalámbricas deficientes dentro de estructuras metálicas de almacenamiento. Las vistas de escritorio del Administrador (Dashboards gerenciales) se tratan como una expansión progresiva del diseño móvil.
*   **Trade-off (Sacrificio Consciente):** Requiere un esfuerzo de diseño de UI inicial doble. No se puede usar una librería genérica de tablas de datos gigantes para pantallas móviles; el equipo de frontend debe crear componentes específicos responsive adaptados para listas móviles compactas y tarjetas táctiles con micro-animaciones.

#### 3. Consecuencias
*   **Impacto Positivo (+):**
    *   **Excelente usabilidad en campo:** Los operarios registran ingresos y confirman picking con un mínimo esfuerzo físico y de manera rápida desde sus dispositivos de mano en los racks.
    *   **Mejora de rendimiento de renderizado:** Interfaces móviles optimizadas y limpias que cargan instantáneamente en hardware de baja gama de tablets industriales.
*   **Impacto Negativo Inevitable (-):**
    *   **Mayor tiempo de desarrollo en Frontend:** Los desarrolladores de Next.js (Carlos Barón y Sebastián Ordóñez) deben maquetar componentes CSS específicos y responsivos con media-queries detalladas, duplicando el esfuerzo de testing visual en múltiples emuladores de dispositivos móviles.
