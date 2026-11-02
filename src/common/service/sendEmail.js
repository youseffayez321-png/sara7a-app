import nodemailer from "nodemailer";
import { randomInt } from "node:crypto";
import { EMAIL, PASSWORD } from "../../../config/config.service.js";
export const sendEmail = async ({ to, subject, html, attachments }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL,
            pass: PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from: `"EL JO" <${EMAIL}>`,
        to,
        subject,
        html: html || "",
        attachments: attachments || [],
    });
    return info.accepted.length > 0 ? true : false;
};
export const generate_otp = () => {
    return randomInt(100000, 1000000).toString();
};
