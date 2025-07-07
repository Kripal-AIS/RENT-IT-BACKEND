import Mongoose from "mongoose";

const AgreementSchema = new Mongoose.Schema(
    {
        renterid: {
            type: String,
            required: true,
        },
        borrowerid: {
            type: String,
            required: true
        },
        assigndate: {
            type: String,
            required: true
        },
        revokedate: {
            type: String,
            required: true
        },
        productid: {
            type: String,
            required: true,
            unique: true
        }
    }, { timestamps: true }
)

const Agreement = Mongoose.model("Agreement", AgreementSchema);
export default Agreement;