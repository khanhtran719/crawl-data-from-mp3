import mongoose from "mongoose";
const { Schema } = mongoose;

export const musicSchema = new Schema({
    title: String,
    singer: String,
});

