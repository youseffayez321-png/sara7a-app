import { Hash } from "../../common/security/hash.js";
import { generate_otp, sendEmail } from "../../common/service/sendEmail.js";
import { eventEmitter } from "../../common/utils/events.js";
import {
    deleteKey,
    getValue,
    incr,
    setValue,
    ttl,
} from "../../DB/service/redis.service.js";
import * as dbService from "../../DB/service/db.service.js";
import { otpEmailTemplate } from "../../common/utils/email.template.js";
import userModel from "../../DB/models/user.model.js";
export const sendEmailOtp = async ({email, isConfirmed = false,subject = "confirm email"}) => {
    const isBlocked = await ttl(`otp::blocked::${email}`);
    if (isBlocked > 0) {
        throw new Error(`you got blocked for ${isBlocked}`, { cause: 400 });
    }
    const ttlOtp = await ttl(`otp::${email}`);
    if (ttlOtp > 0) {
        throw new Error(`you can resend otp after ${ttlOtp}`, { cause: 400 });
    }
    const max_otp = await getValue(`otp::max::${email}`);
    if (max_otp >= 3) {
        await setValue({
            key: `otp::blocked::${email}`,
            value: "1",
            ttl: 60 * 5,
        });
        await deleteKey(`otp::max::${email}`)
        throw new Error(`you exceeded the number of tries`, { cause: 400 });
    }
    const user = await dbService.findOne({
        model: userModel,
        filter: { email: email.toLowerCase(), isConfirmed},
    });
    if (!user)
        throw new Error("email not exist or email already confirmed", {
            cause: 404,
        });

    const otp = generate_otp();
    const otpHash = await Hash(otp);
    await setValue({
        key: `otp::${email}`,
        value: otpHash,
        ttl: 60 * 2,
    });
    eventEmitter.emit("confirm_email", async () => {
        await sendEmail({
            to: email,
            subject,
            html: otpEmailTemplate(otp),
        });
    });
    await incr(`otp::max::${email}`);    
};
