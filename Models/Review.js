import Mongoose from "mongoose";

const ReviewSchema = new Mongoose.Schema(
    {
        productid: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
        },
        review: {
            type: String,
            min: 10,
            required: true,
        },
        userid: {
            type: String,
            required: true
        },
        username:{
            type: String,
            required: true
        },
        renterid: {
            type: String,
            required: true
        }
    }, { timestamps: true }
)

const Review = Mongoose.model("Review", ReviewSchema);
export default Review;