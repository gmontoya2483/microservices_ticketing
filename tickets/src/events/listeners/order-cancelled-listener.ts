import {Listener, OrderCancelledEvent, Subjects} from "@gabrielhernan_tickets/common";
import {Message} from "node-nats-streaming";
import {QueueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled ;
    queueGroupName: string = QueueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message): Promise<void> {


        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket, throw an error
        if(!ticket) {
            throw new Error(`Ticket with id: ${data.ticket.id} was not found`)
        }


        // Mark the ticket as being reserved by setting its orderId property
        ticket.set({orderId: undefined})

        // Save the ticket
        await ticket.save();


        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        });


        // ack the message
        msg.ack();

    }

}