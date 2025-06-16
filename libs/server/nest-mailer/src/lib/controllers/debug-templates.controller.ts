import { Controller, Get, Logger, Param, Req, Res } from '@nestjs/common';
import { TemplateEngine } from '../services';

import type { Request, Response } from 'express';

@Controller('/debug-mailer-templates')
export class DebugController {
  constructor(private templateEngine: TemplateEngine) {}

  logger = new Logger('DebugController');

  @Get('/:templatename')
  async loadtemplate(
    @Req() req: Request,
    @Res() res: Response,
    @Param('templatename') templatename: string,
  ) {
    try {
      if (res['setHeader']) {
        (res as Response).setHeader('Content-Type', 'text/html');
      } else {
        res.header('Content-Type', 'text/html');
      }
      res.send(await this.templateEngine.render(templatename, req.query));
      return;
    } catch (error) {
      this.logger.error(
        `Error rendering template named: ${templatename} with data: \n${JSON.stringify(
          req.query,
          null,
          2,
        )}\n error: ${error}`,
      );
      return '';
    }
  }
}
