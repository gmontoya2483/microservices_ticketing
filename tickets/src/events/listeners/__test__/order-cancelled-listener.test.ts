import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {OrderCancelledEvent} from "@gabrielhernan_tickets/common";
import {Message} from "node-nats-streaming";

const setup = async () => {

    const orderId = new mongoose.Types.ObjectId().toHexString();

    //Create a Listener instance
    const listener = new OrderCancelledListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });
    ticket.set({ orderId });
    await ticket.save();

    // Create a fake data Event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    // create a fake Message Object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, ticket, data, msg};
}


describe('Order cancelled listener', ()=> {
    it('Should unlock a ticket by setting the orderId as undefined', async ()=> {
        const {listener, ticket, data, msg} = await setup();

        // call the on Message function with data object + message object
        await listener.onMessage(data, msg);

        // write assertion to make sure the ticket was reserved
        const unlockedTicket = await Ticket.findById(ticket.id);
        expect(unlockedTicket).toBeDefined();
        expect(unlockedTicket).not.toBeNull();
        expect(unlockedTicket!.orderId).not.toBeDefined();
        expect(unlockedTicket!.version).toEqual(ticket.version + 1)

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
        expect(ticketUpdatedData.orderId).not.toBeDefined();

    });
});


