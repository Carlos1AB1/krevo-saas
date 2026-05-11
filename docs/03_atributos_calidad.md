# Atributos y Escenarios de Calidad (ISO 25010)
**Proyecto:** Krevo SaaS - Warehouse Management System (WMS)
**Fase:** Corte 1 (Análisis y Arquitectura Base)

Este entregable define las metas de calidad no funcionales para **Krevo WMS SaaS** basadas en el estándar **ISO/IEC 25010**. En lugar de utilizar definiciones subjetivas y ambiguas, este documento especifica la justificación de prioridades para el dominio logístico y define escenarios concretos estructurados mediante la metodología de los seis componentes de ingeniería de software.

---

## 1. Priorización y Justificación en el Dominio Logístico

En un sistema WMS multi-tenant, los fallos de software se traducen directamente en pérdidas financieras tangibles en el mundo físico. El equipo de arquitectura ha priorizado los siguientes cuatro atributos del estándar ISO 25010:

```
  +-----------------------------------------------------------------+
  |                       PRIORIDADES ISO 25010                     |
  +-----------------------+-----------------------------------------+
  | 1. CONFIABILIDAD      | Consistencia de stock físico vs digital.|
  +-----------------------+-----------------------------------------+
  | 2. SEGURIDAD          | Aislamiento de datos entre competidores.|
  +-----------------------+-----------------------------------------+
  | 3. RENDIMIENTO        | Operación fluida en el piso de bodega.  |
  +-----------------------+-----------------------------------------+
  | 4. MANTENIBILIDAD     | Adaptabilidad de modelos matemáticos.   |
  +-----------------------+-----------------------------------------+
```

### Justificaciones Específicas del Negocio:
1.  **Confiabilidad (Reliability / Tolerancia a fallos y Recuperabilidad):**
    *   *Justificación:* Si el sistema pierde el rastro de la ubicación de un lote de producto perecedero (por ejemplo, Arequipe bajo regla FEFO) o duplica un saldo de existencias debido a una falla transaccional, se producirá desperdicio de producto vencido, retrasos en la carga de camiones de despacho, y multas contractuales por entregas incompletas (OTIF - *On-Time In-Full*). La consistencia absoluta de los datos es la base de la confianza logística.
2.  **Seguridad (Security / Confidencialidad e Integridad):**
    *   *Justificación:* Bajo el modelo SaaS, competidores comerciales directos compartirán la misma base de datos. Una fuga de información trans-tenant (que permita a la Empresa A ver los inventarios, la rotación de ventas o la lista de proveedores de la Empresa B) constituiría un desastre de confianza comercial que destruiría legal y financieramente la viabilidad de la plataforma.
3.  **Rendimiento y Eficiencia de Desempeño (Performance / Comportamiento temporal):**
    *   *Justificación:* El personal operativo en el CEDI realiza picking y recepción cargando terminales móviles o tablets inalámbricas. Un retraso en la pantalla de confirmación ralentiza físicamente el movimiento de las estibas, generando cuellos de botella en los muelles de carga, tiempos de espera costosos de camiones de transporte y baja productividad laboral. Las respuestas del backend deben ser instantáneas (<500ms).
4.  **Mantenibilidad (Maintainability / Modificabilidad y Analizabilidad):**
    *   *Justificación:* Las fórmulas logísticas como los puntos de reorden (ROP), la cantidad óptima de pedido (EOQ) y la clasificación ABC probabilística son dinámicas y se adaptarán con base a la madurez de los centros de distribución. El código debe ser modular y mantenible para que un equipo pequeño de 4 ingenieros pueda implementar cambios en las reglas de negocio en menos de un día sin riesgo de regresiones en los flujos principales.

---

## 2. Escenarios de Calidad de 6 Componentes

Cada escenario está estructurado bajo los 6 componentes estándar de la ingeniería de software:
1.  **Fuente (Source of Stimulus):** Quién o qué genera el estímulo.
2.  **Estímulo (Stimulus):** El evento o acción que afecta al sistema.
3.  **Entorno (Environment):** Las condiciones bajo las cuales ocurre el estímulo.
4.  **Artefacto (Artifact):** La parte específica del sistema que recibe el estímulo.
5.  **Respuesta (Response):** La acción que ejecuta el sistema como consecuencia directa.
6.  **Medida Cuantificable (Quantifiable Measure):** El criterio objetivo e incuestionable de éxito o aceptación.

---

### Escenario 1: Confiabilidad (Tolerancia a fallos transaccionales)

| Componente | Detalle del Escenario |
| :--- | :--- |
| **1. Fuente** | El sistema operativo, la red inalámbrica del CEDI o el motor de base de datos PostgreSQL. |
| **2. Estímulo** | Pérdida de energía o desconexión del cliente en el muelle de carga durante la ejecución de un traslado de lote pesado (de la Bodega de Insumos a la Bodega de Producción). |
| **3. Entorno** | Operación normal en hora pico de recepción (ej. 10:00 AM), con 30 usuarios concurrentes en el sistema. |
| **4. Artefacto** | Módulo de Gestión de Inventarios (WMS), la conexión del ORM Prisma y la base de datos PostgreSQL. |
| **5. Respuesta** | El sistema detecta el error de socket o la caída de transacción, revierte inmediatamente todos los cambios parciales (ejecuta un *rollback* estricto de base de datos) y registra el error con marcas de tiempo inmutables en el log de auditoría. |
| **6. Medida Cuantificable** | **100%** de las transacciones interrumpidas a mitad de camino se revierten por completo. No puede existir un "estado fantasma" de stock. El estado de la base de datos se restablece a su estado inicial coherente en un tiempo máximo de **1.0 segundo** tras detectarse el fallo, con **0%** de inconsistencias físicas en los saldos. |

---

### Escenario 2: Seguridad (Confidencialidad y aislamiento multi-tenant)

| Componente | Detalle del Escenario |
| :--- | :--- |
| **1. Fuente** | Un usuario malintencionado externo o un operario interno del Tenant A con intenciones de espionaje industrial. |
| **2. Estímulo** | Intento de realizar consultas o mutaciones maliciosas a los datos de inventario del Tenant B manipulando el identificador del tenant en las peticiones HTTP (`tenant_id` en DTOs o ataques IDOR en URLs de API) o mediante inyección SQL en los campos de búsqueda de SKUs. |
| **3. Entorno** | Aplicación web Krevo SaaS desplegada en producción con acceso público desde Internet. |
| **4. Artefacto** | Módulo de Identidad y Acceso (IAM), middleware de validación de JWT, y capa de repositorio de PostgreSQL/ORM Prisma. |
| **5. Respuesta** | El middleware intercepta la petición HTTP, verifica que el `tenant_id` del token JWT firmado criptográficamente no coincide con el recurso solicitado, bloquea inmediatamente la transacción de base de datos, deniega el acceso, y registra un log de alerta de seguridad en la tabla de auditoría con la IP, el ID del atacante y el recurso objetivo. |
| **6. Medida Cuantificable** | **100%** de los accesos no autorizados trans-tenant o ataques de inyección deben ser denegados. El sistema debe responder con un código de estado `HTTP 403 Forbidden` en un tiempo máximo de **200 milisegundos**, y el registro inmutable de auditoría de seguridad debe ser creado en menos de **100 milisegundos** después de interceptado el ataque. |

---

### Escenario 3: Rendimiento (Comportamiento temporal de las consultas)

| Componente | Detalle del Escenario |
| :--- | :--- |
| **1. Fuente** | Operadores de Recepción y Despacho en dispositivos móviles industriales. |
| **2. Estímulo** | Envío de una confirmación masiva de picking que involucra la actualización del kárdex digital para 50 SKUs de manera simultánea en el sistema. |
| **3. Entorno** | Operación en pico de despachos diarios (ej. 4:00 PM) con alta concurrencia en la red inalámbrica local del CEDI. |
| **4. Artefacto** | Módulo de Operaciones (Inbound / Outbound) y Módulo de Inventarios. |
| **5. Respuesta** | El backend procesa las solicitudes, ejecuta las sentencias SQL transaccionales en la base de datos indexada de PostgreSQL, actualiza los saldos y retorna una respuesta JSON de confirmación exitosa al frontend Next.js. |
| **6. Medida Cuantificable** | El tiempo de respuesta de la API (desde la recepción de la petición HTTP por el backend NestJS hasta el envío de la respuesta HTTP de éxito) debe ser menor a **500 milisegundos** en el **95%** de los casos medidos bajo una carga de hasta 50 transacciones por segundo. |

---

### Escenario 4: Mantenibilidad (Modificabilidad del software)

| Componente | Detalle del Escenario |
| :--- | :--- |
| **1. Fuente** | Desarrollador del equipo de backend (ej. Jerónimo Vallejo). |
| **2. Estímulo** | Solicitud de cambio por parte del cliente para implementar una variación matemática en el cálculo probabilístico del Modelo Q de reposición de inventario de Insumos (alterando los pesos de la desviación estándar de la demanda para recalcular el stock de seguridad). |
| **3. Entorno** | Entorno de desarrollo local, con pruebas unitarias parametrizadas y un repositorio Git integrado a flujos de CI/CD automatizados. |
| **4. Artefacto** | Dominio y Casos de Uso del Módulo de Inventario de Krevo Backend (capas independientes de infraestructura bajo Clean Architecture). |
| **5. Respuesta** | Gracias a la separación de capas impuesta por la Clean Architecture en NestJS, el desarrollador modifica exclusivamente la regla de negocio del Modelo Q en el dominio matemático sin necesidad de alterar los controladores HTTP, esquemas de entrada (DTOs), middlewares de autenticación, o repositorios de acceso a la base de datos PostgreSQL. |
| **6. Medida Cuantificable** | El cambio en la regla de negocio se implementa modificando únicamente **1** archivo lógico de dominio. El esfuerzo de desarrollo, testing unitario local y aprobación de integración continua de la lógica modificada debe requerir menos de **4 horas de trabajo** de un solo ingeniero, y el compilador de TypeScript debe garantizar **0%** de errores de tipado o regresión en el resto de módulos del monolito. |

---

## 3. Resumen de Declaración de Exclusiones de Subjetividad

Para garantizar que el documento se base en criterios técnicos cuantitativos y robustos exigidos en la rúbrica del **Corte 1**, se han erradicado las siguientes prácticas de redacción deficientes:
*   **No se usan términos vagos:** Se eliminó por completo el uso de frases ambiguas como *"el sistema debe ser seguro"*, *"el sistema debe reaccionar rápido"* o *"el sistema debe recuperarse de inmediato"*.
*   **Enfoque en métricas objetivas:** Toda declaración de calidad está ligada a un porcentaje de efectividad (**100%** de rechazo), un tiempo exacto en unidades físicas de medida (**<500ms**, **1.0s**, **4 horas de trabajo**), o una cantidad contable de archivos de software modificados (**1 archivo**), permitiendo que la calidad del software sea auditable mediante herramientas de telemetría y pruebas estresadas.
