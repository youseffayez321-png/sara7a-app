import { Router } from "express";
import * as US from "./user.service.js";

const userRouter = Router();

userRouter.post("/signUp", US.signUp);
userRouter.post("/signUp/gmail", US.signUpWithGmail);
userRouter.post("/signIn", US.signIn);
userRouter.get("/profile", US.getProfile);

export default userRouter;
