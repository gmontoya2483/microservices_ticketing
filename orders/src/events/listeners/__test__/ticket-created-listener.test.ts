import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {TicketCreatedEvent} from "@gabrielhernan_tickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";


const setup = async () => {
    // create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);

    // Create a fake data event
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "Concert",
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    };

    // create a fake Message Object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg};
};



describe('Ticket created Listener', ()=> {

    it('Should create and save a ticket', async ()=> {
        const {listener, data, msg} = await setup();

        // call the on Message function with data object + message object
        await listener.onMessage(data, msg);

        // write assertions to make sure a ticket was created!
        const ticket = await Ticket.findById(data.id);
        expect(ticket).not.toBeNull();
        expect(ticket).toBeDefined();
        expect(ticket!.id).toEqual(data.id);
        expect(ticket!.title).toEqual(data.title);
        expect(ticket!.version).toEqual(data.version);
        expect(ticket!.price).toEqual(data.price);

    });

    it('Should ack the message', async ()=> {
        const {listener, data, msg} = await setup();

        // call the on Message function with data object + message object
        await listener.onMessage(data, msg);

        // write assertions to make sure ack function is called!
        expect(msg.ack).toHaveBeenCalled();
    })

})
