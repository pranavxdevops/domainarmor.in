import mongoose from 'mongoose';

const scanLogSchema = new mongoose.Schema(
    {
        domainId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Domain',
            required: true,
            index: true,
        },
        spf: {
            type: Boolean,
            default: false,
        },
        dmarc: {
            type: Boolean,
            default: false,
        },
        dkim: {
            type: Boolean,
            default: false,
        },
        mx: {
            type: [String],
            default: [],
        },
        expiryDate: {
            type: Date,
            default: null,
        },
        blacklisted: {
            type: Boolean,
            default: false,
        },
        score: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const ScanLog = mongoose.models.ScanLog || mongoose.model('ScanLog', scanLogSchema);

export default ScanLog;
