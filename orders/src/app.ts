import express from 'express';
import 'express-async-errors'

import {currentUser, errorHandler, NotFoundError} from "@gabrielhernan_tickets/common";

import cookieSession from "cookie-session";

import {indexOrderRouter} from "./routes/index";
import {deleteOrderRouter} from "./routes/delete";
import {showOrderRouter} from "./routes/show";
import {newOrderRouter} from "./routes/new";


const app = express();

app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);
app.use(currentUser);

app.use(newOrderRouter);
app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

app.all('*',  ()=>{
    throw new NotFoundError();
})


app.use(errorHandler);

export { app };