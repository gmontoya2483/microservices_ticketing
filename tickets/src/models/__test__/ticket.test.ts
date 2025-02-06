
import {Ticket} from "../ticket";

describe('TIcket Model', ()=>{

    it('Should implement optimistic concurrency control (OCC)', async()=>{

        // Create an instance of a Ticket
        const ticket = Ticket.build({
            title: 'concert',
            price: 25,
            userId: '123'
        })

        // Save the ticket to the database
        await ticket.save();

        // fetch the ticket twice
        const firstInstance = await Ticket.findById(ticket.id);
        const secondInstance = await Ticket.findById(ticket.id);

        // make two separate changes to the tickets we fetched
        firstInstance!.set({price: 30});
        secondInstance!.set({price: 40});

        // save the first fetched ticket => OK
        await firstInstance!.save();

        // save the second fetched ticket => expect an error

        try {
            await secondInstance!.save();
        } catch (e) {
            console.log(e);
            return;
        }

        throw new Error('Should not reach this point');

    });

    it('Should increment the version when a ticket is updated', async()=>{

        // Create an instance of a Ticket
        const ticket = Ticket.build({
            title: 'concert',
            price: 25,
            userId: '123'
        })

        // Save the ticket to the database
        await ticket.save();
        expect(ticket.version).toEqual(0);

        await ticket.save();
        expect(ticket.version).toEqual(1);

        await ticket.save();
        expect(ticket.version).toEqual(2);


    });



});
