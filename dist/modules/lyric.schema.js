"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lyricSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
exports.lyricSchema = new Schema({
    title: String,
    singer: String,
    author: String,
    album: String,
    category: String,
    lyric: String,
});
//# sourceMappingURL=lyric.schema.js.map