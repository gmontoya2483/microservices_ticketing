import {Listener, OrderCreatedEvent, Subjects} from "@gabrielhernan_tickets/common";
import {Message} from "node-nats-streaming";
import {QueueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";



export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = QueueGroupName;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message): Promise<void> {

        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket, throw an error
        if(!ticket) {
            throw new Error(`Ticket with id: ${data.ticket.id} was not found`)
        }


        // Mark the ticket as being reserved by setting its orderId property
        ticket.set({orderId: data.id})

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