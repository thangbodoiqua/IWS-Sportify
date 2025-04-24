///src/modelssongModel.js
import mongoose from "mongoose";

const songSChema = new mongoose.Schema({
    title: {type: String, required: true},
    artist: {type: String, required: true},
    imageUrl: {type: String, required: true},
    audioUrl: {type: String, required: true},
    duration: {
        type: Number,
        required: true
    },
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
        required: false
    }
}, {timestamp: true});

export const SongModel = mongoose.model("Song", songSChema)