import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCancelledEvent, OrderStatus} from "@gabrielhernan_tickets/common";
import {Order, OrderDoc} from "../../../models/order";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";

const setup = async  () => {

    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 100,
        version: 0
    });

    await order.save();


    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: order.version + 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }


    return {listener, order, data, msg}


}


describe('Order cancelled Listener', () => {

    it("Should flag the order as cancelled", async ()=> {

        const {listener, order, data, msg} = await setup();
        await listener.onMessage(data, msg);

        const cancelledOrder: OrderDoc | null = await Order.findById(data.id);
        expect(cancelledOrder).toBeDefined();
        expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
        expect(cancelledOrder!.version).toEqual(order.version + 1);
    } );

    it("Should ack the message", async ()=> {

        const {listener, order, data, msg} = await setup();
        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();

    })

})