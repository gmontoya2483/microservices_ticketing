import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedEvent, OrderStatus} from "@gabrielhernan_tickets/common";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";

const setup = async () => {

    // Create an instance of the Listener
    const listener = new OrderCreatedListener(natsWrapper.client);


    // Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });

    await ticket.save();

    // Create a fake data Event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date().toString(),
        version: 0,
        ticket: {
            id: ticket.id,
            price: ticket.price,
        }
    }

    // create a fake Message Object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, ticket, data, msg};
}

describe('Order created Listener', ()=>  {

    it('Should reserve a ticket by setting the orderId', async () => {

        const {listener, ticket, data, msg} = await setup();

        // call the on Message function with data object + message object
        await listener.onMessage(data, msg);

        // write assertion to make sure the ticket was reserved
        const reservedTicket = await Ticket.findById(ticket.id);
        expect(reservedTicket).toBeDefined();
        expect(reservedTicket).not.toBeNull();
        expect(reservedTicket!.orderId).toEqual(data.id)
        expect(reservedTicket!.version).toEqual(ticket.version + 1)

    });
    it('Should ack the message', async () => {

        const {listener, data, msg} = await setup();

        // call the on Message function with data object + message object
        await listener.onMessage(data, msg);

        // write assertions to make sure ack function is called!
        expect(msg.ack).toHaveBeenCalled();

    });

    it('Should publish a ticket updated event', async () => {

        const {listener, ticket, data, msg} = await setup();

        // call the on Message function with data object + message object
        await listener.onMessage(data, msg);

        expect(natsWrapper.client.publish).toHaveBeenCalled();

        const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
        expect(ticketUpdatedData.orderId).toEqual(data.id);

        // expect(natsWrapper.client.publish).toHaveBeenCalledWith(
        //     'ticket:updated',
        //     {
        //         id: ticket.id,
        //         title: ticket.title,
        //         price: ticket.price,
        //         userId: ticket.userId,
        //         orderId: data.id,
        //         version: ticket.version + 1
        //     }
        // );
    })

})