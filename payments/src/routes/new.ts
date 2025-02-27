import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest
} from "@gabrielhernan_tickets/common";
import mongoose from "mongoose";
import {Order} from "../models/order";
import {stripe} from "../stripe";
import {Payment} from "../models/payment";


const router = express.Router();


router.post(
    '/api/payments',
    requireAuth ,
    [
        body('token')
            .not()
            .isEmpty()
            .withMessage('token must be provided'),
        body('orderId')
            .not()
            .isEmpty()
            .withMessage('orderId must be provided')
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('orderId must be a valid ObjectId')

    ],
    validateRequest,
    async (req: Request, res: Response)=> {

        const {token, orderId} = req.body;

        const order = await Order.findById(orderId);
        if(!order) {
            throw new NotFoundError();
        }

        if(order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if(order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Cannot pay for a cancelled order');
        }


        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100,
            source: token

        });
        // console.log(charge);

        const payment = Payment.build({
            orderId,
            stripeId: charge.id,
        });

        await payment.save();
        // console.log(payment);

        res.status(201).json({success: true});
    }
);


export {router as newChargeRouter};


