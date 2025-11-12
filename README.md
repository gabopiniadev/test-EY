# HubSpot ETL Data Platform

> Pipeline completo de extraccion, transformacion y carga para sincronizar contactos (Leads) y oportunidades (Deals) desde HubSpot hacia un data warehouse en PostgreSQL. El proyecto expone ademas APIs analiticas y admite ejecuciones asincronas mediante RabbitMQ.

---

## Caracteristicas principales

- **Extraccion confiable** desde HubSpot CRM con paginacion, manejo de rate limits y control de reintentos.
- **Transformaciones de negocio** para normalizar datos, calcular metricas y limpiar la informacion antes de persistirla.
- **Carga incremental (UPSERT)** a PostgreSQL con indices optimizados para consultas analiticas.
- **APIs REST** para explotar la data procesada (estadisticas de Leads y analisis de Deals).
- **Arquitectura resiliente** que usa Redis para cache/rate limiting y RabbitMQ para orquestar ETLs asincronas.
- **Observabilidad** mediante logs estructurados y trazabilidad del pipeline completo.

---

## Stack tecnologico

| Capa | Tecnologia | Uso |
|------|------------|-----|
| Framework | NestJS 10 | Aplicacion backend y APIs |
| Data Warehouse | PostgreSQL 15 | Persistencia y analitica |
| Cache / Rate limiting | Redis 7 | Cache de queries y control de limites HubSpot |
| Message Broker | RabbitMQ 3 | Desencadenar ETL asincrono |
| ORM | TypeORM 0.3 | Modelado de entidades y migraciones |
| Cliente HTTP | Axios | Consumo de HubSpot CRM API |
| Contenedores | Docker / Compose | Servicios auxiliares locales |

---

## Arquitectura funcional

```mermaid
flowchart LR
    subgraph HubSpot
        HSLeads[HubSpot Leads]
        HSDeals[HubSpot Deals]
    end

    HSLeads -->|API v3| Extractor
    HSDeals -->|API v3| Extractor

    Extractor --> Transformador --> Loader --> PostgreSQL[(Data Warehouse)]

    Loader --> Cache[Redis]
    Loader --> Broker[(RabbitMQ)]

    APIAnalitica[[API Analytics]] --> PostgreSQL
    APIAnalitica --> Cache
```

---

## Estructura de carpetas

```
src/
├─ api/
│  ├─ analytics/      # Endpoints de estadisticas y analisis
│  └─ etl/            # Endpoints para ejecutar ETLs (sync/async)
├─ common/
│  ├─ cache/          # Integracion con Redis
│  ├─ queue/          # Integracion con RabbitMQ
│  └─ config/         # Configuracion global (ConfigModule)
├─ database/
│  ├─ entities/       # Entidades TypeORM (Lead, Deal)
│  ├─ migrations/     # Migraciones de esquema
│  └─ database.module.ts
└─ etl/
   ├─ extract/        # Servicios de extraccion HubSpot
   ├─ transform/      # Reglas de limpieza y normalizacion
   ├─ load/           # Persistencia en PostgreSQL
   └─ etl.service.ts  # Orquestacion del pipeline
```

---

## Puesta en marcha rapida

### 1. Requisitos

- Node.js 18+
- Docker y Docker Compose
- Cuenta HubSpot (opcional: modo mock disponible dejando la API key vacia)

### 2. Instalacion

```bash
# Clonar
git clone <repo-url>
cd test-EY

# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env
# Editar .env para agregar HUBSPOT_API_KEY si se dispone

# Levantar servicios auxiliares
docker-compose up -d

# Ejecutar migraciones (crea tablas e indices)
npm run migration:run

# Iniciar la aplicacion
npm run start:dev
```

La API quedara disponible en `http://localhost:3000/api`.

---

## Variables de entorno clave

| Variable | Descripcion | Valor por defecto |
|----------|-------------|-------------------|
| `HUBSPOT_API_KEY` | Token privado de HubSpot (CRM API v3). Dejalo vacio para modo mock | `""` |
| `POSTGRES_*` | Configuracion de conexion a PostgreSQL | `localhost`, `5432`, `postgres`, `postgres`, `hubspot_dw` |
| `REDIS_HOST` `REDIS_PORT` | Host/puerto de Redis | `localhost`, `6379` |
| `RABBITMQ_URL` | URL de RabbitMQ | `amqp://guest:guest@localhost:5672` |
| `ETL_BATCH_SIZE` | Tamano de lote para carga masiva | `100` |

---

## Ciclo ETL detallado

1. **Extract** (`HubSpotExtractService`)
   - Pagina sobre objetos `contacts` y `deals` usando la API v3.
   - Aplica control de rate limit con Redis (`CacheService`).
   - Pone los mensajes en cola si se ejecuta en modo asincrono.

2. **Transform** (`TransformService`)
   - Normaliza nombres de campos.
   - Convierte valores numericos (monto, fechas) y calcula metricas derivadas.
   - Elimina keys redundantes y estructura los metadatos en JSONB.

3. **Load** (`LoadService`)
   - Ejecuta UPSERT por `hubspotId` para mantener la carga incremental.
   - Ejecuta lotes configurables para optimizar el uso de la base de datos.
   - Registra resultados (creados vs actualizados) para auditoria.

4. **Orquestacion** (`EtlService` y `EtlConsumerService`)
   - Ejecuta Leads, Deals o pipeline completo.
   - Responde sincronicamente o publica un mensaje en RabbitMQ para proceso en background.

---

## API Reference

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/api/etl/leads` | Ejecuta ETL de Leads (body opcional `{ "async": true }`). |
| `POST` | `/api/etl/deals` | Ejecuta ETL de Deals. |
| `POST` | `/api/etl/full` | Ejecuta Leads + Deals. |
| `GET`  | `/api/analytics/leads/stats?startDate&endDate` | Estadisticas agregadas de Leads (totales, lifecycle-stage, tasa de conversion). |
| `GET`  | `/api/analytics/deals/analysis?startDate&endDate` | Analisis de Deals (por pipeline, etapa, monto total, win rate). |

Respuesta tipica de `GET /api/analytics/leads/stats`:

```json
{
  "total": 1542,
  "byLifecycleStage": [
    { "stage": "subscriber", "count": 420 },
    { "stage": "lead", "count": 814 },
    { "stage": "customer", "count": 308 }
  ],
  "conversionRate": 19.97,
  "convertedLeads": 308
}
```

---

## Modelo de datos en PostgreSQL

- **Tabla `leads`**
  - Campos principales: `hubspot_id`, `email`, `lifecycle_stage`, `lead_status`, `hubspot_created_at`, `properties (jsonb)`.
  - Indices: `hubspot_id` (unico), `email`, `lifecycle_stage`, `created_at`.

- **Tabla `deals`**
  - Campos principales: `hubspot_id`, `deal_name`, `amount_numeric`, `currency`, `pipeline`, `dealstage`, `closed_at`, `properties (jsonb)`.
  - Indices: `hubspot_id` (unico), `dealstage`, `pipeline`, `amount_numeric`, `closed_at`.

Migraciones ubicadas en `src/database/migrations` garantizan consistencia en entornos locales y productivos.

---

## Comandos utiles

```bash
# Desarrollo
npm run start:dev

# Produccion (build + run)
npm run build
npm run start:prod

# Migraciones
npm run migration:generate -- -n NombreMigracion
npm run migration:run
npm run migration:revert

# Linter y formateo
npm run lint
npm run format

# Tests
npm run test
npm run test:e2e
```

---

## Buenas practicas y operaciones

- **Seguridad:** mantener `HUBSPOT_API_KEY` fuera del repositorio (gitignore) y usar Secrets en despliegues.
- **Resiliencia:** RabbitMQ asegura reintentos asincronos; Redis evita alcanzar los limites de HubSpot.
- **Monitoreo:** los servicios loguean eventos clave (inicio/fin de ETL, cantidad de registros procesados, errores).
- **Escalabilidad:** los modulos ETL son stateless, lo que permite escalar instancias de NestJS horizontalmente.

---

## Roadmap sugerido

- Integrar pipelines incrementales basados en fechas de actualizacion.
- Agregar dashboards (Grafana/Metabase) sobre el warehouse.
- Incluir autenticacion JWT en las APIs.
- Implementar pruebas E2E con datos mock y escenarios de error.

---

## Licencia

Distribuido con fines de evaluacion tecnica.
