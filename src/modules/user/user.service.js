import { decrypt, Encrypt } from "../../common/security/encrypt.js";
import { Compare, Hash } from "../../common/security/hash.js";
import * as dbService from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client();

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
        },
    });
    return res.status(201).json({ message: "user created", user });
};

export const signUpWithGmail = async (req, res, next) => {
    const { idToken } = req.body;
    const decoded = await client.verifyIdToken({
        idToken,
        audience:
            "350975069962-2bae16tbpma6d7f3kh7a2dm7qujqsi6f.apps.googleusercontent.com",
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
        "yousef123",
        { expiresIn: 60 * 5 },
    );
    const refresh_token = jwt.sign({ id: user.id, email: user.email }, "jo123");

    res.status(200).json({
        message: "done",
        user,
        tokens: { access_token, refresh_token },
    });
};

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await dbService.findOne({
        model: userModel,
        filter: { email: email.toLowerCase() },
    });
    if (!user) {
        throw new Error("email not exist", { cause: 404 });
    }
    // if (user.isConfirmed == false) {
    //     return res.status(400).json({ message: "email not confirmed" });
    // }
    if (!(await Compare(password, user.password))) {
        throw new Error("invalid password", { cause: 400 });
    }

    const access_token = jwt.sign(
        { id: user.id, email: user.email },
        "yousef123",
        {
            expiresIn: 60,
            audience: "http://localhost:4200",
            issuer: "http://localhost:3000",
            notBefore: 30,
        },
    );
    const refresh_token = jwt.sign({ id: user.id, email: user.email }, "jo123");
    return res.status(200).json({
        message: "done",
        user: { ...user._doc, phone: decrypt(user.phone) },
        tokens: { access_token, refresh_token },
    });
};
export const getProfile = async (req, res, next) => {
    const { token } = req.body;
    if (!token) {
        throw Error("token not exist", { cause: 404 });
    }

    const decoded = jwt.verify(token, "yousef123");
    const user = await dbService.findOne({
        model: userModel,
        filter: { email: decoded.email.toLowerCase() },
    });
    if (!user) {
        throw new Error("email not exist", { cause: 404 });
    }
    return res.status(200).json({
        message: "done",
        user: { ...user._doc, phone: decrypt(user.phone) },
    });
};
