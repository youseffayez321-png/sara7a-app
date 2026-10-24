import mongoose from "mongoose";
import {
    userGender,
    userProvider,
    userRole,
} from "../../common/enum/user.enum.js";

const userSchema = new mongoose.Schema(
    {
        fName: {
            type: String,
            required: true,
            trim: true,
            minlenght: 2,
            maxlenght: 15,
        },
        lName: {
            type: String,
            required: true,
            trim: true,
            minlenght: 2,
            maxlenght: 15,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: function () {
                if (this.provider == userProvider.system) {
                    return true;
                }
                return false;
            },
            trim: true,
        },
        profileImage: String,
        coverImage: [String],
        phone: String,
        gender: {
            type: String,
            enum: Object.values(userGender),
            default: userGender.male,
        },
        age: {
            type: Number,
            required: function () {
                if (this.provider == userProvider.system) {
                    return true;
                }
                return false;
            },
            min: 20,
            max: 60,
        },
        roles: {
            type: String,
            enum: Object.values(userRole),
            default: userRole.user,
        },
        provider: {
            type: String,
            enum: Object.values(userProvider),
            default: userProvider.system,
        },
        isConfirmed: Boolean,
        changeCredentialAt: Date,
    },
    {
        timestamps: true,
        strict: true,
        strictQuery: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
