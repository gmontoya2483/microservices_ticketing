import mongoose from 'mongoose';
import {app} from "./app";

const start = async () => {

    console.log('Starting up auth service... !!!');

    if(!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }

    if(!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDb: ', process.env.MONGO_URI);
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, ()=> {
        console.log("Auth service started on port 3000");
    });
};

start().then();

