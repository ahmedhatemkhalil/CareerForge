import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        stripeCustomerId: {
            type: String,
            required: true,
        },

        stripePaymentIntentId: {
            type: String,
            default: null,
        },

        stripeInvoiceId: {
            type: String,
            default: null,
            unique: true,
        },
        amount: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: "usd",
        },

        status: {
            type: String,
            default: "paid",
        },

        paymentMethod: {
            type: String,
            default: null,
        },

        paidAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Payment", paymentSchema);