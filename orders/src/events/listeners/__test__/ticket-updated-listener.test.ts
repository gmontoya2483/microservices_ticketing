import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket, TicketDoc} from "../../../models/ticket";
import mongoose from "mongoose";
import {TicketUpdatedEvent} from "@gabrielhernan_tickets/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    // Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client)

    // Create and save ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: "Concert"
    });

    await ticket.save();

    // Create a fake data object
    const data: TicketUpdatedEvent["data"] = {
        id: ticket.id,
        title: "new concert",
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: ticket.version + 1
    }

    // Create a fake msg object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    // return all this stuff
    return {listener, ticket, data, msg}
};

describe('Ticket updated listener', ()=> {
    it('Should find, update and save a ticket', async ()=> {
        const {listener, ticket, data, msg} = await setup();

        // call the on Message function with data object + message object
        await listener.onMessage(data, msg);

        // write assertions to make sure a ticket was created!
        const updatedTicket: TicketDoc | null = await Ticket.findById(ticket.id);
        expect(updatedTicket).not.toBeNull();
        expect(updatedTicket).toBeDefined();
        expect(updatedTicket!.id).toEqual(data.id);
        expect(updatedTicket!.title).toEqual(data.title);
        expect(updatedTicket!.version).toEqual(data.version);
        expect(updatedTicket!.price).toEqual(data.price);
    });

    it('Should ack the message', async ()=> {
        const {listener, data, msg} = await setup();

        // call the on Message function with data object + message object
        await listener.onMessage(data, msg);

        // write assertions to make sure ack function is called!
        expect(msg.ack).toHaveBeenCalled();

    });
    it('Should not ack the message if version is not the correct one', async ()=>{
        const {listener, data, msg} = await setup();

        // call the on Message function with data object + message object
        try {
            await listener.onMessage({...data, version: 99}, msg);
        } catch(e) {
            console.log(e);
        }
        expect(msg.ack).not.toHaveBeenCalled();
    });
})