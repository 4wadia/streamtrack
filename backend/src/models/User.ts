import mongoose, { Schema, Document } from 'mongoose';

export interface IWatchlistItem {
    contentId: string;
    title: string;
    type: 'movie' | 'tv';
    posterPath?: string;
    status: 'want' | 'watching' | 'watched';
    rating?: number;
    notes?: string;
    addedAt: Date;
    updatedAt?: Date;
}

export interface IUser extends Document {
    firebaseUid: string;
    email: string;
    name?: string;
    services: string[];
    watchlist: IWatchlistItem[];
    createdAt: Date;
    updatedAt: Date;
}

const WatchlistItemSchema = new Schema<IWatchlistItem>({
    contentId: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['movie', 'tv'], required: true },
    posterPath: String,
    status: { type: String, enum: ['want', 'watching', 'watched'], default: 'want' },
    rating: { type: Number, min: 0, max: 10 },
    notes: String,
    addedAt: { type: Date, default: Date.now },
    updatedAt: Date
}, { _id: false });

const UserSchema = new Schema<IUser>({
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: String,
    services: { type: [String], default: [] },
    watchlist: { type: [WatchlistItemSchema], default: [] }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
