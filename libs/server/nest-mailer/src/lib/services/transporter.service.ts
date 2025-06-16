import { Inject, Injectable } from '@nestjs/common';
import { NODE_MAILER_TRANSPORT } from '../tokens';
import { Transporter } from 'nodemailer';

@Injectable()
export class TransporterService {
  constructor(@Inject(NODE_MAILER_TRANSPORT) public transporter: Transporter) {}

  sendEmail() {
    return this.transporter;
  }
}
