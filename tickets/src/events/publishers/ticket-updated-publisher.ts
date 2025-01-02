import {Publisher, Subjects, TicketUpdatedEvent} from "@gabrielhernan_tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}