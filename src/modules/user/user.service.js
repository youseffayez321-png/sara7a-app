import { decrypt, Encrypt } from "../../common/security/encrypt.js";
import { Compare, Hash } from "../../common/security/hash.js";
import * as dbService from "../../DB/service/db.service.js";
import userModel from "../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { randomUUID } from "node:crypto";
import {
    deleteKey,
    getValue,
    incr,
    setValue,
    ttl,
} from "../../DB/service/redis.service.js";
import { generate_otp, sendEmail } from "../../common/service/sendEmail.js";
import { eventEmitter } from "../../common/utils/events.js";
import { sendEmailOtp } from "./user.helper.js";
import { otpEmailTemplate } from "../../common/utils/email.template.js";
import {
    ACCESS_TOKEN_SIGNATURE,
    AUDIENCE,
    REFRESH_TOKEN_SIGNATURE,
} from "../../../config/config.service.js";
import { success_respons } from "../../common/utils/success.respons.js";

const client = new OAuth2Client();

//======================== sign up ==========================
export const signUp = async (req, res, next) => {
    const { fName, lName, email, password, gender, age, phone } = req.body;

    if (
        await dbService.findOne({
            model: userModel,
            filter: { email: email.toLowerCase() },
        })
    ) {
        throw new Error("email already exist", { cause: 409 });
    }
    const otp = generate_otp();
    const otpHash = await Hash(otp);
    await setValue({
        key: `otp::${email}`,
        value: otpHash,
        ttl: 60 * 2,
    });
    await setValue({
        key: `otp::max::${email}`,
        value: 1,
        ttl: 60 * 2,
    });
    eventEmitter.emit("confirm_email", async () => {
        await sendEmail({
            to: email,
            subject: "confirm email",
            html: otpEmailTemplate(otp),
        });
    });
    const paths = [];
    for (const file of req.files.attachments) {
        paths.push(file.path);
    }

    const user = await dbService.create({
        model: userModel,
        data: {
            fName,
            lName,
            email,
            password: await Hash(password, 12),
            gender,
            age,
            phone: Encrypt(phone),
            profileImage: req.files.attachment[0].path,
            coverImage: paths,
        },
    });
    success_respons({
        res,
        statusCode: 201,
        message: "user created",
        data: user,
    });
};
//======================== resend Otp ==========================
export const resendOtp = async (req, res, next) => {
    const { email } = req.body;
    await sendEmailOtp({ email, isConfirmed: { $exists: false } });

    success_respons({
        res,
    });
};

//======================== sign up with gmail ==========================
export const signUpWithGmail = async (req, res, next) => {
    const { idToken } = req.body;
    const decoded = await client.verifyIdToken({
        idToken,
        audience: AUDIENCE,
    });
    const { picture, family_name, given_name, email_verified, email } =
        decoded.getPayload();
    let user = await dbService.findOne({
        model: userModel,
        filter: { email: email.toLowerCase() },
    });
    if (!user) {
        user = await dbService.create({
            model: userModel,
            data: {
                fName: given_name,
                lName: family_name,
                email,
                isCofirmed: email_verified,
                profileImage: picture,
                provider: "google",
            },
        });
    }
    const access_token = jwt.sign(
        { id: user.id, email: user.email },
        ACCESS_TOKEN_SIGNATURE,
        { expiresIn: 60 * 5 },
    );
    const refresh_token = jwt.sign(
        { id: user.id, email: user.email },
        REFRESH_TOKEN_SIGNATURE,
    );
    success_respons({
        res,
        data: { user, tokens: { access_token, refresh_token } },
    });
};
//======================== forget password ==========================
export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    await sendEmailOtp({
        email,
        isConfirmed: true,
        subject: "forget password",
    });
    success_respons({
        res,
    });
};
//======================== reset password ==========================
export const resetPassword = async (req, res, next) => {
    const { email, code, password } = req.body;
    const otpValue = await getValue(`otp::${email}`);
    if (!otpValue) throw new Error("otp expire");
    if (!(await Compare(code, otpValue))) {
        throw new Error("invalid otp");
    }
    await dbService.findOneAndUpdate({
        model: userModel,
        filter: { email, isCofirmed: { $exists: true } },
        update: {
            password: await Hash(password),
            changeCredentialAt: new Date(),
        },
    });
    await deleteKey(`otp::${email}`);
    return res.status(200).json({ message: "done" });
    success_respons({
        res,
    });
};
//======================== sign in ==========================
export const signIn = async (req, res, next) => {
    const { email, password } = req.body;
    if ((await ttl(`blocked::${email}`)) > 0) {
        await deleteKey(`attempts::${email}`);
        throw new Error(
            `try again later after ${await ttl(`blocked::${email}`)}`,
        );
    }
    if ((await getValue(`attempts::${email}`)) >= 5) {
        await setValue({
            key: `blocked::${email}`,
            value: 1,
            ttl: 5 * 60,
        });
        throw new Error("try again later");
    }
    const user = await dbService.findOne({
        model: userModel,
        filter: {
            email: email.toLowerCase(),
            provider: "system",
            isConfirmed: { $exists: true },
        },
    });
    if (!user) {
        throw new Error("email not exist", { cause: 404 });
    }
    if (!(await Compare(password, user.password))) {
        await incr(`attempts::${email}`);
        throw new Error("invalid password", { cause: 400 });
    }
    if (user?.twoStepVerification) {
        await sendEmailOtp({
            email,
            isConfirmed: true,
            subject: "two step verification",
        });
        success_respons({
            res,
            message: "otp send to your email",
        });
    }
    const tokenId = randomUUID();

    const access_token = jwt.sign(
        { id: user.id, email: user.email },
        ACCESS_TOKEN_SIGNATURE,
        {
            jwtid: tokenId,
            expiresIn: "1d",
            audience: "http://localhost:4200",
            issuer: "http://localhost:3000",
        },
    );
    const refresh_token = jwt.sign(
        { id: user.id, email: user.email },
        REFRESH_TOKEN_SIGNATURE,
        {
            jwtid: tokenId,
        },
    );
    success_respons({
        res,
        data: {
            user: { ...user._doc, phone: decrypt(user.phone) },
            tokens: { access_token, refresh_token },
        },
    });
};
//======================== sign in with 2SV ==========================
export const signIn2SV = async (req, res, next) => {
    const { email, otp } = req.body;
    const otpValue = await getValue(`otp::${email}`);
    if (!otpValue) throw new Error("otp expire");
    if (!(await Compare(otp, otpValue))) {
        throw new Error("invalid otp");
    }
    const user = await dbService.findOne({
        model: userModel,
        filter: {
            email: email.toLowerCase(),
            provider: "system",
            isConfirmed: { $exists: true },
            twoStepVerification: { $exists: true },
        },
    });
    if (!user) {
        throw new Error("email not exist", { cause: 404 });
    }
    const tokenId = randomUUID();

    const access_token = jwt.sign(
        { id: user.id, email: user.email },
        ACCESS_TOKEN_SIGNATURE,
        {
            jwtid: tokenId,
            expiresIn: "1d",
            audience: "http://localhost:4200",
            issuer: "http://localhost:3000",
        },
    );
    const refresh_token = jwt.sign(
        { id: user.id, email: user.email },
        REFRESH_TOKEN_SIGNATURE,
        {
            jwtid: tokenId,
        },
    );
    success_respons({
        res,
        data: {
            user: { ...user._doc, phone: decrypt(user.phone) },
            tokens: { access_token, refresh_token },
        },
    });
};
//======================== confirm Email  ==========================
export const confirmEmail = async (req, res, next) => {
    const { email, otp } = req.body;
    const otpValue = await getValue(`otp::${email}`);
    if (!otpValue) {
        throw new Error("otp expire", { cause: 400 });
    }
    if (!(await Compare(otp, otpValue))) {
        throw new Error("invalid otp", { cause: 400 });
    }
    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: {
            email,
            isConfirmed: { $exists: false },
        },
        update: {
            isConfirmed: true,
        },
    });
    if (!user) {
        throw new Error("user not exist or email already confirmed", {
            cause: 404,
        });
    }
    await deleteKey(`otp::${email}`);
    success_respons({
        res,
        message: "email confirmed",
    });
};
//======================== get profile ==========================
export const getProfile = async (req, res, next) => {
    success_respons({
        res,
        data: { user: { ...req.user._doc, phone: decrypt(req.user.phone) } },
    });
};

//======================== refresh token ==========================
export const refreshToken = async (req, res, next) => {
    const { authorization } = req.headers;
    console.log(req.headers);

    if (!authorization) {
        throw Error("token not exist", { cause: 404 });
    }

    const decoded = jwt.verify(authorization, ACCESS_TOKEN_SIGNATURE);
    const user = await dbService.findOne({
        model: userModel,
        filter: { email: decoded.email.toLowerCase() },
    });
    if (!user) {
        throw new Error("email not exist", { cause: 404 });
    }
    const access_token = jwt.sign(
        { id: user.id, email: user.email },
        ACCESS_TOKEN_SIGNATURE,
        {
            expiresIn: 60 * 5,
            audience: "http://localhost:4200",
            issuer: "http://localhost:3000",
        },
    );
    success_respons({
        res,
        data: access_token,
    });
};
//======================== share profile ==========================
export const shareProfile = async (req, res, next) => {
    const { id } = req.params;
    const user = await dbService.findById({
        model: userModel,
        id,
        options: {
            password: 0,
            isConfirmed: 0,
            provider: 0,
            email: 0,
        },
    });
    if (!user) {
        throw new Error("user not found", { cause: 404 });
    }
    success_respons({
        res,
        message: "user found",
        data: { ...user._doc, phone: decrypt(user.phone) },
    });
};
//======================== update profile ==========================
export const updateProfile = async (req, res, next) => {
    const { fName, lName, gender, age, phone } = req.body;
    const updateQuery = {};
    if (fName != undefined) {
        updateQuery.fName = fName;
    }
    if (lName != undefined) {
        updateQuery.lName = lName;
    }
    if (gender != undefined) {
        updateQuery.gender = gender;
    }
    if (age != undefined) {
        updateQuery.age = age;
    }
    if (phone != undefined) {
        updateQuery.phone = Encrypt(phone);
    }
    const user = await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        update: updateQuery,
    });
    success_respons({
        res,
        message: "user created",
        data: user,
    });
};
//======================== enable 2 step verification ==========================
export const enable2SV = async (req, res, next) => {
    if (req.user?.twoStepVerification)
        throw new Error("you already enabled the 2 step verification");
    await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.decoded.id,
        update: { twoStepVerification: true },
    });
    success_respons({
        res,
        message: "2 step verfication enabled",
    });
};
//======================== update password ==========================
export const updatePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!(await Compare(oldPassword, req.user.password))) {
        throw new Error("old password is wrong");
    }
    req.user.password = await Hash(newPassword);
    req.user.changeCredentialAt = new Date();
    await req.user.save();

    success_respons({
        res,
        message: "password updated",
        data: req.user,
    });
};
//======================== logout ==========================
export const logout = async (req, res, next) => {
    const { flag } = req.query;
    if (flag && flag == "all") {
        req.user.changeCredentialAt = new Date();
        await req.user.save();
        await deleteKey(`revoke_token::${req.user._id}`);
    } else {
        await setValue({
            key: `revoke_token::${req.user._id}::${req.decoded.jti}`,
            value: `${req.decoded.jti}`,
            ttl: req.decoded.exp - Math.floor(Date.now() / 1000),
        });
        success_respons({
            res,
        });
    }
};
