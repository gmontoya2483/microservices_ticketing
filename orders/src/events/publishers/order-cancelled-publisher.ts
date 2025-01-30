import {OrderCancelledEvent, Publisher, Subjects} from "@gabrielhernan_tickets/common";


export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}