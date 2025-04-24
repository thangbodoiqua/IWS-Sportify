// src/models/albumModel.js
import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  coverUrl: { type: String, required: true },
  description: { type: String, default: "" },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
}, { timestamps: true });

const AlbumModel = mongoose.model("Album", albumSchema);
export default AlbumModel;