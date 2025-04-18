import express from 'express';
import 'express-async-errors'

import cookieSession from "cookie-session";

import {currentUserRouter} from "./routes/current-user";
import {signinRouter} from "./routes/signin";
import {signoutRouter} from "./routes/signout";
import {signupRouter} from "./routes/signup";
import {errorHandler, NotFoundError} from "@gabrielhernan_tickets/common";
// import {errorHandler} from "./middlewares/error-handler";
// import {NotFoundError} from "./errors/not-found-error";

const app = express();

app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cookieSession({
        signed: false,
        // secure: false,  // Digital Ocean without SSL
        secure: process.env.NODE_ENV !== 'test',  //Locally
    })
);


app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*',  ()=>{
    throw new NotFoundError();
})


app.use(errorHandler);

export { app };