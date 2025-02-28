import request from 'supertest';
import {app} from '../../app';
import mongoose from "mongoose";
import {Order} from "../../models/order";
import {OrderStatus} from "@gabrielhernan_tickets/common";
import { stripe } from '../../stripe'
import {Payment} from "../../models/payment";
import {natsWrapper} from "../../nats-wrapper";


jest.mock('../../stripe');

describe('New Route', ()=> {

    it('Should return "404 Not found" when order does not exist', async () => {
        await request(app).post('/api/payments').set('Cookie', signup()).send({
            token: '1232',
            orderId: new mongoose.Types.ObjectId().toHexString(),
        }).expect(404);
    });
    it('Should return "401 Not authorized" when order does not belong to the user', async ()=> {

        const order = Order.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            status: OrderStatus.Created,
            userId: new mongoose.Types.ObjectId().toHexString(),
            price: 20,
            version: 0
        });

        await order.save();


        await request(app).post('/api/payments').set('Cookie', signup()).send({
            token: '1232',
            orderId: order.id,
        }).expect(401);



    });
    it('Should return "400 Bad request" when order was already cancelled', async() => {

        const userId = new mongoose.Types.ObjectId().toHexString();

        const order = Order.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            status: OrderStatus.Created,
            userId: userId,
            price: 20,
            version: 1
        });

        order.set({status: OrderStatus.Cancelled});

        await order.save();


        const response = await request(app)
            .post('/api/payments')
            .set('Cookie', signup(userId))
            .send({
            token: '1232',
            orderId: order.id,
        }).expect(400);

    });

    it('Should return a 201 with valid inputs', async () => {

        const userId = new mongoose.Types.ObjectId().toHexString();
        const fakeStripeId =  new mongoose.Types.ObjectId().toHexString();

        const order = Order.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            status: OrderStatus.Created,
            userId: userId,
            price: 20,
            version: 1
        });
        await order.save();

        // @ts-ignore
        jest.spyOn(stripe.charges, 'create').mockReturnValue({ id: fakeStripeId})

        await request(app)
            .post('/api/payments')
            .set('Cookie', signup(userId))
            .send({
                token: 'tok_visa',
                orderId: order.id,
            }).expect(201);




        expect(stripe.charges.create).toHaveBeenCalled();

        const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
        expect(chargeOptions.source).toEqual('tok_visa');
        expect(chargeOptions.currency).toEqual('usd');
        expect(chargeOptions.amount).toEqual(order.price * 100);


        expect(natsWrapper.client.publish).toHaveBeenCalled();


        const payment =  await Payment.findOne({
            orderId: order.id,
            stripeId: fakeStripeId
        });

        expect(payment).not.toBeNull();



    });


})