import * as dbService from "../../DB/service/db.service.js";
import userModel from "../../DB/models/user.model.js";
import messageModel from "../../DB/models/message.model.js";

//======================== create message ==========================
export const createMessage = async (req, res, next) => {
    const { content, userId } = req.body;

    if (!content && !req.files.length) throw new Error("content is required");
    const user = await dbService.findById({
        model: userModel,
        id: userId,
    });
    if (!user) throw new Error("user not exist", { cause: 404 });

    const paths = [];
    for (const file of req.files) {
        paths.push(file.path);
    }

    const message = await dbService.create({
        model: messageModel,
        data: {
            content,
            userId,
            attachments: paths,
        },
    });
    success_respons({
        res,
        statusCode: 201,
        message: "message created",
        data: message,
    });
};
//======================== getAllMessages ==========================
export const getAllMessages = async (req, res, next) => {
    const messages = await dbService.find({
        model: messageModel,
        filter: {
            userId: req.user._id,
        },
    });
    success_respons({
        res,
        statusCode: 201,
        data: messages,
    });
};
//======================== getMessageById ==========================
export const getMessageById = async (req, res, next) => {
    const message = await dbService.findOne({
        model: messageModel,
        filter: {
            id: req.params.id,
            userId: req.user._id,
        },
    });
    success_respons({
        res,
        statusCode: 201,
        data: message,
    });
};
