import mongoose from 'mongoose';

const biddingSessionSchema = new mongoose.Schema({
  productId: { type: String, required: true, },
  startedAt: { type: Date, default: Date.now },
  biddingDuration: { type: Number, default: 10 }, // in minutes
  isCompleted: { type: Boolean, default: false }
});

export default mongoose.model("BiddingSession", biddingSessionSchema);