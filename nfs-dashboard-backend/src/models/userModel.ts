import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorSecret: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;