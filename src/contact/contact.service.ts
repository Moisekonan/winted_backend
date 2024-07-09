// contact.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { EmailService } from 'src/common/services/email.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,

    private readonly emailService: EmailService,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    await this.contactRepository.save(contact);

    // Envoyer un e-mail de confirmation de contact
    await this.emailService.sendResponseContact(createContactDto);

    // Envoyer un e-mail de l'equipe de contact
    await this.emailService.sendContactEmail(createContactDto);

    return contact;
  }

  async findAll(): Promise<Contact[]> {
    return await this.contactRepository.find();
  }
}
