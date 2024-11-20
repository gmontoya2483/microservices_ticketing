import request from 'supertest';
import {app} from '../../app'
import mongoose from "mongoose";


describe('Show Tickets routes', () => {

    it('Should return a 404 if the ticket is not found', async () => {
        const id = global.generateMongoId();
        await request(app).get(`/api/tickets/${id}`)
            .send()
            .expect(404)
    });
    it('Should return the ticket if it is found ', async () => {

        const title = 'Ticket 1';
        const price = 10

        // create a ticket
        const newTicket = await request(app).post('/api/tickets')
            .set('Cookie', global.signup())
            .send({
                title, price
            })
            .expect(201)


        const response = await request(app)
            .get(`/api/tickets/${newTicket.body.id}`)
            .send()
            .expect(200);

        expect(response.body.title).toEqual(title);
        expect(response.body.price).toEqual(price);


    });


})