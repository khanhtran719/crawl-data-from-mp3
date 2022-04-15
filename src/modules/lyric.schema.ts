import mongoose from "mongoose";
const { Schema } = mongoose;

export const lyricSchema = new Schema({
    title: String,
    singer: String,
    author: String,
    album: String,
    category: String,
    lyric: String,
});

