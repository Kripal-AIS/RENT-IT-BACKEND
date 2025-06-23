import Mongoose from "mongoose";

const ProductSchema = new Mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            min: 3
        },
        description: {
            type: String,
            required: true,
            min: 10
        },
        age: {
            type: String,
            required: true
        },
        rent: {
            type: Number,
            required: true
        },
        timeperiod: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        renterid: {
            type: String,
            required: true,
            ref: 'User'
        },
        borrowerid:{
            type:String,
        },
        borrower:{
            username:{
                type:String
            },
            avatar:{
                type:String
            }
        },
        agreement:{
            from:{
                type:String
            },
            to:{
                type:String
            }
        },
        image: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true,
            max: 20,
            min: 2
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        ratedusers: {
            type: Number,
            default: 0
        },
        issued: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
)


const Product = Mongoose.model("Product", ProductSchema);
export default Product;