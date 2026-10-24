import * as dbService from "../../DB/service/db.service.js";
import userModel from "../../DB/models/user.model.js";
import messageModel from "../../DB/models/message.model.js";

//======================== sign up ==========================
export const createMessage = async (req, res, next) => {
    const { content, userId } = req.body;
    
    if (!content && !req.files.length)
        throw new Error("content is required");
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
    return res.status(201).json({ message: "message created", data: message });
};
