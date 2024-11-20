import {Router, Request, Response} from "express";
import {body} from 'express-validator'
import {NotAuthorizedError, NotFoundError, requireAuth, validateRequest} from "@gabrielhernan_tickets/common";
import {Ticket} from "../models/ticket";



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

        ticket.set({
            title,
            price
        });

        await ticket.save()

        res.status(200).json(ticket);


});


export {router as updateTicketRouter}