import jwt from "jsonwebtoken";
import { findOne } from "../../DB/service/db.service.js";
import userModel from "../../DB/models/user.model.js";
import { getValue, ttl } from "../../DB/service/redis.service.js";

export const authentication = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        throw Error("token not exist", { cause: 404 });
    }

    const decoded = jwt.verify(authorization, "yousef123");
    const user = await findOne({
        model: userModel,
        filter: { email: decoded.email.toLowerCase() },
    });
    if (!user) {
        throw new Error("email not exist", { cause: 404 });
    }
    if (!user?.isConfirmed) {
        throw new Error("user not confirmed yet ", { cause: 404 });
    }
    if (user?.changeCredentialAt?.getTime() > decoded.iat * 1000) {
        throw new Error("you log out from all devices", { cause: 404 });
    }
    if ((await ttl(`revoke_token::${user._id}::${decoded.jti}`)) > 0) {
        throw new Error("you must login in again", { cause: 404 });
    }
    req.user = user;
    req.decoded = decoded;
    next();
};
