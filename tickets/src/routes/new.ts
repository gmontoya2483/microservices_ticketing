import express, {Request, Response} from "express";
import {body} from "express-validator";
import {requireAuth, validateRequest} from "@gabrielhernan_tickets/common";
import {Ticket} from "../models/ticket";
import {TicketCreatedPublisher} from "../events/publishers/ticket-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.post('/api/tickets', requireAuth, [
    body('title').trim().not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({gt: 0}).withMessage('Price must be greater than 0')
], validateRequest ,async (req: Request, res: Response) => {

    const {title, price} = req.body;
    const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id
    });

    const newTicket = await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    });

    res.status(201).json(newTicket);
})


export { router as createTicketRouter }