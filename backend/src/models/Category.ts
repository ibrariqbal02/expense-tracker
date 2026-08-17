import mongoose  from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User", default:''}
},{timestamps:true})

export const Category = mongoose.model('Category', categorySchema)