import express from 'express'
import {body} from 'express-validator'
import {User} from "../models/user";
import {Password} from "../services/password";
import jwt from "jsonwebtoken";
import {BadRequestError, validateRequest} from "@gabrielhernan_tickets/common";

const router = express.Router()

router.post('/api/users/signin', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is mandatory'),
],
    validateRequest,
    async (req: express.Request, res: express.Response) => {

        const {email, password} = req.body;

        const existingUser =  await User.findOne({ email });
        if(!existingUser) {
            throw new BadRequestError(`Invalid credentials`);
        }


        if(!await Password.compare(existingUser.password, password)) {
            throw new BadRequestError(`Invalid credentials`);
        }

        // Generate JWT
        const userJwt = jwt.sign({
            id: existingUser._id,
            email: existingUser.email
        }, process.env.JWT_KEY!);

        // Store it on session object
        req.session = {
            jwt:userJwt
        };


        res.status(200).json(existingUser)
});

export {router as signinRouter};