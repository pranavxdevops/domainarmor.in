import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        domain: {
            type: String,
            required: [true, 'Domain is required'],
            trim: true,
            lowercase: true,
        },
        lastScore: {
            type: Number,
            default: null,
        },
        lastStatus: {
            type: String,
            enum: ['healthy', 'warning', 'critical', null],
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index: one user can't add the same domain twice
domainSchema.index({ userId: 1, domain: 1 }, { unique: true });

const Domain = mongoose.models.Domain || mongoose.model('Domain', domainSchema);

export default Domain;
