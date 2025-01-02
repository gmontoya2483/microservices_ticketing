import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";




jest.mock("../nats-wrapper.ts");

let mongo: any

beforeAll(async () => {
    process.env.JWT_KEY = 'asdf';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});


beforeEach(async () => {
    jest.clearAllMocks();
    if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections();

        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }
});


afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});








declare global {
    var generateMongoId: ()=>mongoose.Types.ObjectId
}


 global.generateMongoId = () => {
    return new mongoose.Types.ObjectId();
 }


declare global {
    var signup: ()=>string[]
}

global.signup =  () => {

    // Build a JWT payload {id, email}.
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'fake@fake.com'
    }

    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session Object. {jwt: MY_JWT}
    const session = {jwt: token};

    // Turn that session into json
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return a string
    return [`session=${base64}`];

}
