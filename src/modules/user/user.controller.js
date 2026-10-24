import { Router } from "express";
import * as US from "./user.service.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { userRole } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
import {
    confirmEmailSchema,
    forgetPasswordSchema,
    refreshTokenSchema,
    resendOtpSchema,
    resetPasswordSchema,
    shareProfileSchema,
    signInSchema,
    signUpSchema,
    updatePasswordSchema,
    updateProfileSchema,
} from "./user.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";

const userRouter = Router();

userRouter.post(
    "/signUp",
    multerLocal({
        customPath: "users",
        customTypes: ["image/png", "image/jpeg"],
    }).fields([
        { name: "attachment", max: 1 },
        { name: "attachments", mas: 2 },
    ]),
    validation(signUpSchema),
    US.signUp,
);

userRouter.post("/signUp/gmail", US.signUpWithGmail);

userRouter.post("/signIn", validation(signInSchema), US.signIn);

userRouter.get(
    "/profile",
    authentication,
    authorization(Object.values(userRole)),
    US.getProfile,
);

userRouter.post(
    "/refresh-token",
    validation(refreshTokenSchema),
    US.refreshToken,
);

userRouter.get(
    "/share-profile/:id",
    validation(shareProfileSchema),
    US.shareProfile,
);

userRouter.patch(
    "/update-profile",
    validation(updateProfileSchema),
    authentication,
    US.updateProfile,
);
userRouter.patch(
    "/update-password",
    validation(updatePasswordSchema),
    authentication,
    US.updatePassword,
);
userRouter.patch("/logout", authentication, US.logout);
userRouter.patch(
    "/confirmEmail",
    validation(confirmEmailSchema),
    US.confirmEmail,
);
userRouter.patch(
    "/forget-password",
    validation(forgetPasswordSchema),
    US.forgetPassword,
);
userRouter.patch(
    "/reset-password",
    validation(resetPasswordSchema),
    US.resetPassword,
);
userRouter.post("/resend-otp", validation(resendOtpSchema), US.resendOtp);
export default userRouter;
