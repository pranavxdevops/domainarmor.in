import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema(
    {
        domain: {
            type: String,
            required: [true, 'Domain is required'],
            trim: true,
            lowercase: true,
            unique: true,
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

const Domain = mongoose.models.Domain || mongoose.model('Domain', domainSchema);

export default Domain;
