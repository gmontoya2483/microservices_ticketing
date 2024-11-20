import {Router, Request, Response} from "express";
import {Ticket} from "../models/ticket";
import {NotFoundError} from "@gabrielhernan_tickets/common";


const router = Router();


router.get('/api/tickets/:ticketId', async (req: Request, res: Response) => {
    const {ticketId} = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }

    res.status(200).json(ticket);
})






export {router as showTicketRouter}