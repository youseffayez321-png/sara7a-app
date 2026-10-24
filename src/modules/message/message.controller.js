import { Router } from "express";
import * as US from "./message.service.js";
import { authentication } from "../../common/middleware/authentication.js";
import { validation } from "../../common/middleware/validation.js";
import * as MV from "./message.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/user.enum.js";

const messageRouter = Router();

messageRouter.post(
    "/create",
    multerLocal({
        customPath: "messages",
        customTypes: multer_enum.imgaes,
    }).array("attachments"),
    validation(MV.createMessageSchema),
    US.createMessage,
);
export default messageRouter;
