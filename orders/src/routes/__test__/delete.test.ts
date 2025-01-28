import request from 'supertest'
import {app} from '../../app'
import {Ticket} from "../../models/ticket";
import {OrderStatus} from "@gabrielhernan_tickets/common";
import {Order} from "../../models/order";

describe('Delete Route', ()=> {

    it('Should flag the order as cancelled', async ()=> {

        const user = global.signup();

        // Create a ticket
        const ticket = Ticket.build({
            title: 'new ticket',
            price: 15
        });

        await ticket.save();

        // make a request to build an order with this ticket
        const {body: order } = await request(app)
            .post('/api/orders')
            .set('Cookie', user)
            .send({ticketId: ticket.id})
            .expect(201);


        // make a request to fetch the order
        await request(app)
            .delete(`/api/orders/${order.id}`)
            .set('Cookie', user)
            .send()
            .expect(200);


        const cancelledOrder = await Order.findById(order.id);
        expect(cancelledOrder).toBeTruthy();
        expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);

    });


    it.todo('Should emit an order cancelled event');

});