import request from "supertest";
import {app} from '../../app'
import {Ticket} from "../../models/ticket";

import {natsWrapper} from '../../nats-wrapper'



describe('New ticket route', ()=> {
    it('Should have a route handler listening to /api/tickets for post request', async () => {

        const response = await request(app)
            .post('/api/tickets')
            .send({});

        expect(response.status).not.toEqual(404);
    });

    it('Should only be accessed if the user is signed in', async () => {
        const response = await request(app)
            .post('/api/tickets')
            .send({});

        expect(response.status).toEqual(401);

    });

    it('Should return a status other than 401 if the user is signed in', async () => {
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signup())
            .send({});

        expect(response.status).not.toEqual(401);

    });


    it('Should return an error if an invalid title is provided', async () => {
        await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signup())
            .send({
                title: '',
                price: 10
            }).expect(400);

        await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signup())
            .send({
                price: 10
            })
            .expect(400);

    });

    it('Should return an error if an invalid price is provided', async () => {

        await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signup())
            .send({
                title: 'Title',
                price: -10
            }).expect(400);

        await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signup())
            .send({
                title: 'Title',
            })
            .expect(400);


    });


    it('Should create a ticket with valid inputs', async () => {

        // Add in a check to make sure a ticket was saved

        const title = 'Title';
        const price= 10;
        const numberOfTicketsBefore = await Ticket.countDocuments();



        await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signup())
            .send({
                title,
                price
            }).expect(201);


        const tickets = await Ticket.find({});

        expect(tickets.length).toEqual(numberOfTicketsBefore + 1);
        expect(tickets[0].price).toEqual(price);
        expect(tickets[0].title).toEqual(title);

    });

    it('should publish an Event', async () => {

        const title = 'Title';
        const price= 10;

        await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signup())
            .send({
                title,
                price
            }).expect(201);


        // console.log(natsWrapper);

        expect(natsWrapper.client.publish).toHaveBeenCalled();





    });


})