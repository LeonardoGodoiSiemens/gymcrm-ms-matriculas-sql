# GymCRM — Microsserviço de Matrículas (Azure SQL)

**Integrantes:** Igor Thiago Lara da Silva · Leonardo Ceccon Sobol · Leonardo Godoi Siemens · Rafael Augusto de Oliveira Souza

Responsável pelas **matrículas** dos alunos (RF04/RF05): criação, renovação, trancamento e cancelamento, com plano **mensal / trimestral / anual**. Persistência no **Azure SQL Database (Free 1 DTU)**; publica o evento `EnrollmentCreated` (Event-Driven).

## Arquitetura
- **Clean Architecture:** `src/domain` (entidade `Enrollment`, regras, eventos, portas) · `src/application` (casos de uso) · `src/infrastructure` (Azure SQL com `mssql`, publisher do Service Bus) · `src/api` (REST, DTOs, Swagger, docs AsyncAPI).
- **Vertical Slice:** `create-enrollment`, `get-enrollment`, `list-enrollments`, `update-enrollment`, `renew-enrollment`, `delete-enrollment`.
- **Regras de domínio:** `total = monthlyPrice × meses` (1/3/12); `endDate = startDate + meses`; status `ACTIVE | FROZEN | CANCELLED`; **renovar** soma um período à vigência e reativa (matrícula `CANCELLED` não pode ser renovada).
- **Event-Driven:** ao criar uma matrícula publica `EnrollmentCreated` na fila `enrollment-created` (Azure Service Bus), consumida pela Azure Function. Publicação *best effort*: se o broker cair, a matrícula continua criada e o erro é logado. Sem `SERVICEBUS_CONNECTION_STRING`, o evento só vai para o log.

## Endpoints
| Método | Rota | Descrição |
|---|---|---|
| POST | `/enrollments` | Cria matrícula (publica `EnrollmentCreated`) |
| GET | `/enrollments?page=&limit=` | Lista (paginado) |
| GET | `/enrollments/:id` | Busca por id |
| PUT | `/enrollments/:id` | Atualiza (inclui **trancar/cancelar** via `status`; total e vigência recalculados) |
| POST | `/enrollments/:id/renew` | **Renova** a matrícula |
| DELETE | `/enrollments/:id` | Remove |
| GET | `/health` · `/swagger` · `/events` | Health (ping no SQL) · Swagger · documentação AsyncAPI (`/asyncapi.yaml`) |

Corpo do POST: `{ "studentName", "studentEmail", "planName", "period": "MONTHLY|QUARTERLY|ANNUAL", "monthlyPrice", "startDate"? }`.
Erros: `{ "code": "ENROLLMENT_NOT_FOUND" | "VALIDATION_ERROR", "message": "..." }`. A tabela `dbo.Enrollments` é criada automaticamente no primeiro acesso.

## Variáveis de ambiente
| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta HTTP | `3002` |
| `SQL_CONNECTION_STRING` | Connection string ADO.NET do Azure SQL | — (obrigatória) |
| `SERVICEBUS_CONNECTION_STRING` | Habilita publicação no Service Bus | vazio |
| `SERVICEBUS_QUEUE` | Nome da fila | `enrollment-created` |

## Rodar
```bash
npm install
cp .env.example .env    # preencha SQL_CONNECTION_STRING
npm run start:dev       # Swagger: http://localhost:3002/swagger
```
Docker: `docker build -t <usuario>/gymcrm/ms-matriculas:v1 .` → `docker login` → `docker push <usuario>/gymcrm/ms-matriculas:v1`
Azure SQL: criar o servidor + banco *Free offer*, liberar o IP do serviço no firewall e copiar a connection string.

## Testes
`npm test` · `npm run test:unit` · `npm run test:e2e` · `npm run test:arch`
