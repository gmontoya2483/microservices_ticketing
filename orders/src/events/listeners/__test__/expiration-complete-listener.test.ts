import {ExpirationCompleteListener} from "../expiration-complete-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {ExpirationCompleteEvent, OrderStatus} from "@gabrielhernan_tickets/common";
import {Ticket, TicketDoc} from "../../../models/ticket";
import mongoose from "mongoose";
import {Order} from "../../../models/order";
import {Message} from "node-nats-streaming";


const setup = async () => {
    // create an instance of the listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);


    const ticket: TicketDoc = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });

    await ticket.save();

    const order = Order.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket,
    });

    await order.save();



    // Create a fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }


    // create a fake Message Object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, ticket, order,  data, msg};
};


describe('Expiration complete listener', ()=> {

    it('Should update the order status to cancelled', async ()=> {

        const {listener, order,  data, msg} = await setup();
        await listener.onMessage(data, msg);

        const cancelledOrder = await Order.findById(order.id);
        expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
        expect(cancelledOrder!.version).toEqual(order.version + 1);

    });
    it('Should emit an order cancelled event', async ()=> {
        const {listener,  data, msg} = await setup();

        await listener.onMessage(data, msg);

        expect(natsWrapper.client.publish).toHaveBeenCalled();


        expect(natsWrapper.client.publish).toHaveBeenCalled();

        const orderCancelledData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
        // console.log(orderCancelledData);
        expect(orderCancelledData.id).toEqual(data.orderId);

    });
    it('Should ack the message', async ()=> {
        const {listener,  data, msg} = await setup();
        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();

    });

});