import { MailerService } from '@nestjs-modules/mailer';
import { template } from 'nestjs-mailer';
import { Injectable } from '@nestjs/common';
import { ContactDto } from '../dao/contact.dto';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendSubscriptionEmail(email: string): Promise<void> {
    console.log('email : ', email);
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bienvenue à notre newsletter !',
      html: template('src/views/welcome.hbs', { email }),
    });
  }

  async sendResponseContact(contact: ContactDto): Promise<void> {
    const { email, name } = contact;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Nous avons bien reçu votre message !',
      html: template('src/views/contact-response.hbs', { name }),
    });
  }

  async sendContactEmail(contact: ContactDto): Promise<void> {
    const { email, name, message } = contact;
    await this.mailerService.sendMail({
      to: 'mokonan99@gmail.com',
      subject: 'Nouveau message depuis votre site!',
      html: template('src/views/contact.hbs', { email, name, message }),
    });
  }

  async sendSubscriptionEmailToSeller(
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bienvenue sur NUMERAMA, Artisan!',
      html: template('src/views/welcome-seller.hbs', {
        email,
        firstName,
        lastName,
      }),
    });
  }
}
