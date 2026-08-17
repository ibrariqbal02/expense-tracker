import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // Format: "YYYY-MM" (e.g., "2026-08")
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Budget = mongoose.model('Budget', budgetSchema);