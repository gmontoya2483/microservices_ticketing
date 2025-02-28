import {PaymentCreatedEvent, Publisher, Subjects} from "@gabrielhernan_tickets/common";


export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}