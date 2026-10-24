import joi from "joi";
import { Types } from "mongoose";

export const generalRules = {
    id: joi.string().custom((value, helper) => {
        if (Types.ObjectId.isValid(value)) {
            return true;
        } else {
            return helper.message("invalid id");
        }
    }),
    email: joi.string().email(),
    password: joi.string(),
    file: joi.object({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        path: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        size: joi.number(),
    }),
    token: joi.object({
        authorization: joi.string().required(),
        "postman-token": joi.string(),
        "content-length": joi.string(),
        host: joi.string(),
        "user-agent": joi.string(),
        accept: joi.string(),
        "accept-encoding": joi.string(),
        connection: joi.string(),
    }),
};
