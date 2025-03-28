import {ExpirationCompleteEvent, Listener, OrderStatus, Subjects} from "@gabrielhernan_tickets/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {OrderCancelledPublisher} from "../publishers/order-cancelled-publisher";
import {Order} from "../../models/order";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject:Subjects.ExpirationComplete = Subjects.ExpirationComplete;

    queueGroupName: string = queueGroupName;
    async onMessage(data: ExpirationCompleteEvent["data"], msg: Message): Promise<void> {

        const order = await Order.findById(data.orderId).populate('ticket');

        if(!order) {
            throw new Error("Order not found");
        }

        if(order.status === OrderStatus.Complete) {
            msg.ack();
            return;
        }


        order.set({
            status: OrderStatus.Cancelled,
        });


        await order.save()

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            ticket: {id: order.ticket.id},
            version: order.version
        });

        msg.ack();
    }

}