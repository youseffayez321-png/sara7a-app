import { Router } from "express";
import * as MS from "./message.service.js";
import { authentication } from "../../common/middleware/authentication.js";
import { validation } from "../../common/middleware/validation.js";
import * as MV from "./message.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/user.enum.js";

const messageRouter = Router({ caseSensitive: true, strict: true });

messageRouter.post(
    "/create",
    multerLocal({
        customPath: "messages",
        customTypes: multer_enum.imgaes,
    }).array("attachments"),
    validation(MV.createMessageSchema),
    MS.createMessage,
);
messageRouter.get("/", authentication, MS.getAllMessages);
messageRouter.get("/:id", authentication, MS.getMessageById);

export default messageRouter;
