import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        purchaseId: {
            type: String,
            unique:true,
            required: true,
        },
        productId: {
            type: String,
            required: true,
        },
        purchaseDate: {
            type: Date, 
            default: Date.now()
        },
    },
    {
        timestamps: false,
        collection: "purchases",
        _id : false 
    }
);



purchaseSchema.statics.addPurchase = async function (userId, purchaseID, productId,) {
    try {
        const purchase = await this.create({ userId, purchaseID, productId});
        return purchase;
    } catch (error) {
        throw error;
    }
}


export default mongoose.model("Purchase", purchaseSchema);