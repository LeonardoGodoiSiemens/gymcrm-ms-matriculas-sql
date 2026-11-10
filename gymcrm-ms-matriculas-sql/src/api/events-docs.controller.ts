import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ASYNCAPI_YAML, EVENTS_HTML } from './events-docs';

@ApiExcludeController()
@Controller()
export class EventsDocsController {
  @Get('events')
  @Header('Content-Type', 'text/html; charset=utf-8')
  page(): string {
    return EVENTS_HTML;
  }

  @Get('asyncapi.yaml')
  @Header('Content-Type', 'text/yaml; charset=utf-8')
  yaml(): string {
    return ASYNCAPI_YAML;
  }
}
