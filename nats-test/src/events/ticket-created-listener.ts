import {Message, Stan} from "node-nats-streaming";
import {Listener} from "./base-listener";
import {Subjects} from "./subjects";
import {TicketCreatedEvent} from "./ticket-created-event";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    queueGroupName: string = 'payments-service';
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;

    onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
        console.log('#', msg.getSequence())
        console.log('ID -> ', data.id);
        console.log('Title -> ', data.title);
        console.log('Price -> ', data.price);

        msg.ack();
    }

    constructor(client: Stan) {
        super(client);
    }

}