
import { NextFunction, Request, Response } from "express";
import {RequestValidationError} from "../errors/request-validation-error";
import {DatabaseConnectionError} from "../errors/database-connection-error";
import {CustomError} from "../errors/custom-error";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {



    if (err instanceof CustomError) {
        res.status(err.statusCode).json({
            errors: err.serializeErrors(),
        });
    } else {
        console.error(err);
        res.status(500).json({
            errors: [
                {
                    message: "Something went wrong",
                }
            ]
        });
    }





}