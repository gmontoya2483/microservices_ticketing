import express, {Request, Response} from 'express';
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from "@gabrielhernan_tickets/common";
import {body} from "express-validator";
import mongoose from "mongoose";
import {Ticket, TicketDoc} from "../models/ticket";
import {Order} from "../models/order";


const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;


router.post('/api/orders',requireAuth,  [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input:string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided')
], validateRequest, async (req: Request, res: Response) => {

    const {ticketId} = req.body;

    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if(!ticket) {
        throw new NotFoundError();
    }

    // Make sure that ticket is not already reserved
    const isReserved = await ticket.isReserved();
    if(isReserved) {
       throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate the expiration date
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS); // + 15 minutes

    // Build the order and save it to the database
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket: ticket
    });
    await order.save();

    //TODO: Publish an event saying that an order  was created

    res.status(201).json(order);
});


export { router as newOrderRouter };