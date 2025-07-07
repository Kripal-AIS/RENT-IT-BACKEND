import mongoose from "mongoose";

const ProductRequestSchema = new mongoose.Schema(
    {
        startdate: {
            type: String,
            required: true
        },
        tilldate: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        product: {
            _id: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            img: {
                type: String,
                required: true
            }
        },
        owner: {
            _id: {
                type: String,
                required: true
            },
            username: {
                type: String,
                required: true
            },
            avatar: {
                type: String,
                required: true
            },
        },
        userid: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        avatar: {
            type: String
        },
        mobile: {
            type: Number,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    }, { timestamps: true }
)

const ProductRequest = mongoose.model("ProductRequest", ProductRequestSchema);

export default ProductRequest;