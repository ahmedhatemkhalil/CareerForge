import Payment from "../models/Payment.js";
import stripe from "./stripe.service.js";

const getRefId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value.id || null;
};

export const recordPaymentFromInvoice = async (invoice, user) => {
    const invoiceId = getRefId(invoice.id) || invoice.id;
    if (!invoiceId || !user?._id) {
        return null;
    }

    const existingPayment = await Payment.findOne({ stripeInvoiceId: invoiceId });
    if (existingPayment) {
        return existingPayment;
    }

    return Payment.create({
        userId: user._id,
        stripeCustomerId: String(invoice.customer),
        stripePaymentIntentId: getRefId(invoice.payment_intent),
        stripeInvoiceId: invoiceId,
        amount: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency || "usd",
        status: "paid",
        paymentMethod: invoice.collection_method || "subscription",
        paidAt: invoice.status_transitions?.paid_at
            ? new Date(invoice.status_transitions.paid_at * 1000)
            : new Date(),
    });
};

export const recordPaymentFromCheckoutSession = async (user, sessionInput) => {
    if (!user?._id || !sessionInput?.id) {
        return null;
    }

    const needsExpand =
        sessionInput.amount_total == null ||
        (sessionInput.invoice == null && sessionInput.payment_intent == null);

    const session = needsExpand
        ? await stripe.checkout.sessions.retrieve(sessionInput.id, {
              expand: ["invoice", "payment_intent"],
          })
        : sessionInput;

    const invoiceId = getRefId(session.invoice);
    const paymentIntentId = getRefId(session.payment_intent);
    const dedupeInvoiceId = invoiceId || `checkout_${session.id}`;

    const existingPayment = await Payment.findOne({
        $or: [
            { stripeInvoiceId: dedupeInvoiceId },
            ...(paymentIntentId
                ? [{ stripePaymentIntentId: paymentIntentId }]
                : []),
        ],
    });

    if (existingPayment) {
        return existingPayment;
    }

    let amount = (session.amount_total || 0) / 100;
    let currency = session.currency || "usd";

    if (amount <= 0 && session.invoice && typeof session.invoice === "object") {
        amount = (session.invoice.amount_paid || 0) / 100;
        currency = session.invoice.currency || currency;
    }

    if (amount <= 0 && invoiceId) {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        amount = (invoice.amount_paid || 0) / 100;
        currency = invoice.currency || currency;
    }

    return Payment.create({
        userId: user._id,
        stripeCustomerId: String(session.customer || user.stripeCustomerId),
        stripePaymentIntentId: paymentIntentId,
        stripeInvoiceId: dedupeInvoiceId,
        amount,
        currency,
        status: "paid",
        paymentMethod: session.mode === "subscription" ? "subscription" : "card",
        paidAt: new Date(),
    });
};
