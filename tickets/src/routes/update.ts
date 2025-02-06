import {Router, Request, Response} from "express";
import {body} from 'express-validator'
import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
    validateRequest
} from "@gabrielhernan_tickets/common";
import {Ticket} from "../models/ticket";
import {natsWrapper} from "../nats-wrapper";
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";



const router = Router();


router.put('/api/tickets/:id',
    requireAuth,
    [
        body('title').trim().not().isEmpty().withMessage('Title is required'),
        body('price').isFloat({gt: 0}).withMessage('Price must be greater than 0')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { title, price } = req.body;

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            throw new NotFoundError();
        }

        if(ticket.userId !== req.currentUser!.id){
            throw new NotAuthorizedError();
        }

        if(ticket.orderId) {
            throw new BadRequestError('Cannot edit a reserved ticket');
        }

        ticket.set({
            title,
            price
        });

        await ticket.save()


        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });

        res.status(200).json(ticket);


});


export {router as updateTicketRouter}