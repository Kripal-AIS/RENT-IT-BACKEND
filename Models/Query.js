import mongoose from "mongoose";

const  QuerySchema = new mongoose.Schema(
    {

        title: {
            type: String,
            required: true,
            min: 5,
            max: 100
        },
        description: {
            type: String,
            required: true,
            min: 10
        },
        avatar:{
            type: String,
        },
        userid: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
    },{timestamps:true}
)

const Query = mongoose.model("Query", QuerySchema);

export default Query;