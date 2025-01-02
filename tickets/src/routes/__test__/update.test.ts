import request from "supertest";
import {app} from '../../app';
import {natsWrapper} from "../../nats-wrapper";




describe('Update ticket routes', ()=>{



    it('Should return a 404 if ticket is found ', async () => {
        const id = global.generateMongoId()
        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', global.signup())
            .send({title: 'updated Title', price: 23})
            .expect(404);

    })

    it('Should return a 401 if user is not authenticated', async () => {
        const id = global.generateMongoId()
        await request(app)
            .put(`/api/tickets/${id}`)
            .send({title: 'updated Title', price: 23})
            .expect(401);

    })

    it('Should return a 401 if user does not own the ticket', async () => {

        const newTicket = await request(app)
            .post(`/api/tickets`)
            .set('Cookie', global.signup())
            .send({title: 'Title_1', price: 10})
            .expect(201);

        const id = newTicket.body.id;

        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', global.signup())
            .send({title: 'updated Title', price: 23})
            .expect(401);
    })

    it('Should return a 400 if user provides an invalid title or price', async () => {

        const cookie = global.signup();

        const newTicket = await request(app)
            .post(`/api/tickets`)
            .set('Cookie', cookie)
            .send({title: 'Title_1', price: 10})
            .expect(201);

        const id = newTicket.body.id;



        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', cookie)
            .send({title: '', price: 23})
            .expect(400);


        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', cookie)
            .send({tittle: 'updated Title', price: 23})
            .expect(400);


        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', cookie)
            .send({title: 'updated Title'})
            .expect(400);


        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', cookie)
            .send({title: 'updated Title', price: -10})
            .expect(400);

        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', cookie)
            .send({title: 'updated Title', price: 0})
            .expect(400);


        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', cookie)
            .send({title: 'updated Title', price: 'hello'})
            .expect(400);

    })

    it('Should return a 200 if the ticket is updated', async () => {

        const cookie = global.signup();

        const newTicket = await request(app)
            .post(`/api/tickets`)
            .set('Cookie', cookie)
            .send({title: 'Title_1', price: 10})
            .expect(201);

        const id = newTicket.body.id;


        const title = "updated Title"
        const price = 5.23


        const response = await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie',cookie)
            .send({title, price})
            .expect(200);

        // Check response
        expect(response.body.title).toEqual(title);
        expect(response.body.price).toEqual(price);

        // Check database
        const ticket = await request(app).get(`/api/tickets/${id}`).send();
        expect(ticket.body.title).toEqual(title);
        expect(ticket.body.price).toEqual(price);


    });

    it('should publish an Event when a ticket is updated', async () => {

        const cookie = global.signup();

        const newTicket = await request(app)
            .post(`/api/tickets`)
            .set('Cookie', cookie)
            .send({title: 'Title_1', price: 10})
            .expect(201);

        const id = newTicket.body.id;


        const title = "updated Title"
        const price = 5.23


        const response = await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie',cookie)
            .send({title, price})
            .expect(200);

        expect(natsWrapper.client.publish).toHaveBeenCalled();


    })




});


