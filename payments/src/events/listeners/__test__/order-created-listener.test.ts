import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedEvent, OrderStatus} from "@gabrielhernan_tickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Order, OrderDoc} from "../../../models/order";

const setup = async () => {

    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date().toString(),
        version: 0,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 100
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, data, msg};

}

describe('Order created listener', () => {

    it('Should replicate the order info', async ()=> {

        const {listener, data, msg} = await setup();

        await listener.onMessage(data, msg);

        const order: OrderDoc| null = await Order.findById(data.id);

        expect(order).toBeDefined();
        expect(order!.status).toEqual(OrderStatus.Created);
        expect(order!.id).toEqual(data.id);
        expect(order!.version).toEqual(data.version);
        expect(order!.price).toEqual(data.ticket.price);

    });


    it('Should ack the msg', async ()=> {

        const {listener, data, msg} = await setup();
        await listener.onMessage(data, msg);
        expect(msg.ack).toHaveBeenCalled()

    });



});