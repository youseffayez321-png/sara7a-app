import joi from "joi";
import { generalRules } from "../../common/utils/generalRules.js";

export const signUpSchema = {
    body: joi
        .object({
            fName: joi.string().required().min(2).max(10).alphanum(),
            lName: joi.string().required().min(2).max(10).alphanum(),
            email: generalRules.email.required(),
            password: generalRules.password.required(),
            phone: joi.string().required(),
            age: joi.number().required().min(20).max(60),
            gender: joi.string().required(),
        })
        .required(),
    files: joi.object({
        attachments: joi.array().items(generalRules.file.required()).required(),
        attachment: joi.array().items(generalRules.file.required()).required(),
    }),
};
export const signInSchema = {
    body: joi
        .object({
            email: generalRules.email.required(),
            password: generalRules.password.required(),
        })
        .required(),
};
export const refreshTokenSchema = {
    headers: generalRules.token.required(),
};

export const shareProfileSchema = {
    params: joi.object({ id: generalRules.id.required() }),
};

export const updateProfileSchema = {
    body: joi.object({
        fName: joi.string().min(2).max(10).alphanum(),
        lName: joi.string().min(2).max(10).alphanum(),
        phone: joi.string(),
        age: joi.number().min(20).max(60),
        gender: joi.string(),
    }),
};
export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: generalRules.password.required(),
        newPassword: generalRules.password.required(),
    }),
};
export const confirmEmailSchema = {
    body: joi.object({
        email: generalRules.email.required(),
        otp: joi
            .string()
            .pattern(/^[0-9]{6}$/)
            .required(),
    }),
};
export const resendOtpSchema = {
    body: joi.object({ email: generalRules.email.required() }),
};
export const forgetPasswordSchema = {
    body: joi.object({ email: generalRules.email.required() }),
};
export const resetPasswordSchema = {
    body: joi.object({
        email: generalRules.email.required(),
        code: joi
            .string()
            .pattern(/^[0-9]{6}$/)
            .required(),
        password: generalRules.password.required(),
    }),
};
