import mongoose from "mongoose";

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
            required: function(){
                if(this.provider=="system"){
                    return true
                }
                return false
            },
            trim: true,
        },
        profileImage:String,
        phone: String,
        gender: {
            type: String,
            enum: ["male", "female"],
            default: "male",
        },
        age: {
            type: Number,
            required: function(){
                if(this.provider=="system"){
                    return true
                }
                return false
            },
            min: 20,
            max: 60,
        },
        provider: {
            type: String,
            enum: ["system", "google"],
            default: "system",
        },
        isConfirmed: {
            type: Boolean,
            default: false,
        },
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
