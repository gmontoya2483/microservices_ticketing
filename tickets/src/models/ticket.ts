import mongoose from "mongoose";

import {updateIfCurrentPlugin} from "mongoose-update-if-current";

// interface to build a new ticket
interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}


// An interface that describes the properties that a Ticket Document has
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
}

// An interface that describes the properties tha a Ticket Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attr: TicketAttrs): TicketDoc;
}


const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    }
},{
    toJSON: {
        transform(doc: any, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }

    }
});

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
}

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket }