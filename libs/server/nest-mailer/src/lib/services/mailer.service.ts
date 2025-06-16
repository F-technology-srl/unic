import { Injectable } from '@nestjs/common';
import { TemplateEngine } from './template-engine.service';
import { TransporterService } from './transporter.service';
import * as Mail from 'nodemailer/lib/mailer';

interface SendEmailParameters<DataType>
  extends Omit<Mail.Options, 'html' | 'watchHtml' | 'text'> {
  data: DataType;
}

@Injectable()
export class MailerService<DataType> {
  constructor(
    private transporterService: TransporterService,
    private templateEngine: TemplateEngine,
    private templateName: string,
  ) {}

  async sendMail(options: SendEmailParameters<DataType>) {
    const emailbody = await this.templateEngine.render(
      this.templateName,
      options.data,
    );

    await this.transporterService.transporter.sendMail({
      ...options,
      html: emailbody,
    });
  }
}
