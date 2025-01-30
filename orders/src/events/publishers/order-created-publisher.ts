import {OrderCreatedEvent, Publisher, Subjects} from "@gabrielhernan_tickets/common";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
}