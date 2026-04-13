// This is only a partial User Schema, not the full Fyre User Schema.

import { randomId } from '@fallencodes/seyfert-utils';
import { model, Schema } from 'mongoose';

export interface UserI {
    _id: string;
    userId: string;
    active: boolean;
}

const userSchema = new Schema<UserI>({
    _id: { required: true, type: String, default: () => randomId(16) },
    active: { required: true, type: Boolean, default: false },
    userId: { required: true, type: String }
}, { _id: false, versionKey: false, timestamps: true });

export default model('users', userSchema);
