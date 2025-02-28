import mongoose from "mongoose";
import {OrderStatus} from "@gabrielhernan_tickets/common";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";


interface OrderAttrs {
    id: string;
    status: OrderStatus;
    userId: string;
    price: number;
    version: number;
}

export interface OrderDoc extends mongoose.Document {
    status: OrderStatus;
    userId: string;
    price: number;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
    findByEvent(event: {id: string, version: number}): Promise<OrderDoc | null>;
}


const orderSchema = new mongoose.Schema({
    userId: {
        type:String,
        required:true,
    },
    price: {
        type:Number,
        required:true,
        min:0
    },
    status: {
        type:String,
        required:true,
        enum: Object.values(OrderStatus),
    }
}, {
    toJSON: {
        transform(doc: OrderDoc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});


orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);


orderSchema.statics.findByEvent = (event: {id: string, version: number}): Promise<OrderDoc | null> => {
    return Order.findOne({
        _id: event.id,
        version: event.version - 1
    });
}

orderSchema.statics.build = (attrs: OrderAttrs): OrderDoc => {
    const {id, ...rest} = attrs;
    return new Order({
        _id: id,
        ...rest,
    });
}


const Order: OrderModel = mongoose.model<OrderDoc,OrderModel>('Order', orderSchema);
export { Order }