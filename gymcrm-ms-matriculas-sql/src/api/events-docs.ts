/** Contrato do evento publicado por este serviço (AsyncAPI 3.0). Fonte única: também exportado em docs/asyncapi.yaml. */
export const ASYNCAPI_YAML = `asyncapi: 3.0.0
info:
  title: GymCRM - Eventos do Microsserviço de Matrículas
  version: 1.0.0
  description: Eventos publicados pelo MS Matrículas (Azure SQL) no Azure Service Bus.
channels:
  enrollmentCreated:
    address: enrollment-created
    description: Fila do Azure Service Bus que recebe um evento a cada matrícula criada.
    messages:
      EnrollmentCreated:
        $ref: '#/components/messages/EnrollmentCreated'
operations:
  publishEnrollmentCreated:
    action: send
    channel:
      $ref: '#/channels/enrollmentCreated'
    summary: Publicado após a criação de uma matrícula (POST /enrollments).
components:
  messages:
    EnrollmentCreated:
      name: EnrollmentCreated
      title: Matrícula criada
      contentType: application/json
      payload:
        type: object
        required: [eventId, type, occurredAt, data]
        properties:
          eventId:
            type: string
            format: uuid
          type:
            type: string
            const: EnrollmentCreated
          occurredAt:
            type: string
            format: date-time
          data:
            type: object
            required: [enrollmentId, studentName, studentEmail, planName, period, monthlyPrice, total, startDate, endDate, status]
            properties:
              enrollmentId: { type: integer, example: 1 }
              studentName: { type: string, example: Maria Souza }
              studentEmail: { type: string, format: email, example: maria@email.com }
              planName: { type: string, example: Musculação + Aulas Coletivas }
              period: { type: string, enum: [MONTHLY, QUARTERLY, ANNUAL], example: QUARTERLY }
              monthlyPrice: { type: number, example: 129.9 }
              total: { type: number, example: 389.7 }
              startDate: { type: string, format: date-time }
              endDate: { type: string, format: date-time }
              status: { type: string, example: ACTIVE }
`;

export const EVENTS_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>GymCRM - Documentação de Eventos (AsyncAPI)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <p style="font-family:sans-serif;padding:8px">Contrato bruto: <a href="asyncapi.yaml">asyncapi.yaml</a></p>
  <asyncapi-component
    schemaUrl="asyncapi.yaml"
    cssImportPath="https://unpkg.com/@asyncapi/react-component@3.2.2/styles/default.min.css">
  </asyncapi-component>
  <script src="https://unpkg.com/@asyncapi/web-component@3.1.8/lib/asyncapi-web-component.js" defer></script>
</body>
</html>`;
