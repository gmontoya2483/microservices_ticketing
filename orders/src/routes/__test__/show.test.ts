import request from 'supertest'
import {app} from '../../app'
import {Ticket} from "../../models/ticket";

describe('Show route tests',  ()=>{

    it('Should fetch the order', async()=> {

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
        const {body: fetchedOrder } = await request(app)
            .get(`/api/orders/${order.id}`)
            .set('Cookie', user)
            .send()
            .expect(200);

        expect(fetchedOrder.id).toEqual(order.id);
    })


    it('Should not fetch the order if the order does not belong to the user', async()=> {

        const userOne = global.signup();
        const userTwo = global.signup();

        // Create a ticket
        const ticket = Ticket.build({
            title: 'new ticket',
            price: 15
        });

        await ticket.save();

        // make a request to build an order with this ticket for the userOne
        const {body: order } = await request(app)
            .post('/api/orders')
            .set('Cookie', userOne)
            .send({ticketId: ticket.id})
            .expect(201);


        // make a request to fetch the order with userTwo
        await request(app)
            .get(`/api/orders/${order.id}`)
            .set('Cookie', userTwo)
            .send()
            .expect(401);

    })

})


