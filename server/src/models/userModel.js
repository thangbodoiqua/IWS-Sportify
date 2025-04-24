///src/model'/userModel.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    verifyOtp: {type: String, defaut: ''},
    verifyOtpExpireAt: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    resetOtp: {type: String, defaut: ''},
    resetOtpExpireAt: {type: Number, default: 0},  
})

const userModel = mongoose.models.user || mongoose.model('User', userSchema);

export default userModel;