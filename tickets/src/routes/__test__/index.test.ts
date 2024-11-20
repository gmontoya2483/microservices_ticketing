import request from 'supertest';
import {app} from '../../app';


const createTicket = async (title: string, price: number) => {
    return request(app).post('/api/tickets').set('Cookie', global.signup()).send({
        title,
        price
    })
}

describe('Index Tickets routes', () => {

    it('Should be able to fetch a list of tickets', async () => {

        const ticketsToCreate = [
            createTicket('Ticket_1,', 10),
            createTicket('Ticket_2,', 20),
            createTicket('Ticket_3,', 30),
            createTicket('Ticket_4,', 40)
        ]

        await Promise.all(ticketsToCreate);

        const response = await request(app).get('/api/tickets').send().expect(200);

        expect(response.body.length).toEqual(ticketsToCreate.length);


    })
});