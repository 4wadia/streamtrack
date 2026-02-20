import { describe, it, expect, beforeAll, afterAll, beforeEach, mock } from "bun:test";
import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import discoverRoutes from "./discover.routes";
import { User } from "../models/User";

// Mock firebase service
mock.module("../services/firebase.service", () => ({
    verifyIdToken: async (token: string) => {
        if (token === "valid-token") {
            return { uid: "test-uid", email: "test@example.com" };
        }
        return null;
    },
    initializeFirebase: () => { }
}));

const app = express();
app.use(express.json());
app.use("/api/discover", discoverRoutes);

describe("Discover Routes - Custom Vibes Validation", () => {
    beforeAll(async () => {
        const uri = "mongodb://localhost:27017/streamtrack_test";
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await User.create({
            firebaseUid: "test-uid",
            email: "test@example.com",
            customVibes: [
                {
                    id: "cv_test",
                    name: "Test Vibe",
                    genres: [28],
                    createdAt: new Date()
                }
            ]
        });
    });

    it("should reject invalid minRating", async () => {
        const res = await request(app)
            .post("/api/discover/vibes/custom")
            .set("Authorization", "Bearer valid-token")
            .send({ name: "Bad Rating", genres: [28], minRating: 11 });

        expect(res.status).toBe(400);
    });

    it("should reject invalid color", async () => {
        const res = await request(app)
            .post("/api/discover/vibes/custom")
            .set("Authorization", "Bearer valid-token")
            .send({ name: "Bad Color", genres: [28], color: "red" });

        expect(res.status).toBe(400);
    });

    it("should reject invalid genres", async () => {
        const res = await request(app)
            .post("/api/discover/vibes/custom")
            .set("Authorization", "Bearer valid-token")
            .send({ name: "Bad Genres", genres: [28.5] });

        expect(res.status).toBe(400);
    });

    it("should accept minRating of 0", async () => {
        const res = await request(app)
            .post("/api/discover/vibes/custom")
            .set("Authorization", "Bearer valid-token")
            .send({ name: "Zero Rating", genres: [28], minRating: 0 });

        expect(res.status).toBe(201);
        expect(res.body.customVibe.minRating).toBe(0);
    });

    it("should reject invalid update payloads", async () => {
        const res = await request(app)
            .put("/api/discover/vibes/custom/cv_test")
            .set("Authorization", "Bearer valid-token")
            .send({ name: "", genres: [] });

        expect(res.status).toBe(400);

        const res2 = await request(app)
            .put("/api/discover/vibes/custom/cv_test")
            .set("Authorization", "Bearer valid-token")
            .send({ minRating: -1 });

        expect(res2.status).toBe(400);

        const res3 = await request(app)
            .put("/api/discover/vibes/custom/cv_test")
            .set("Authorization", "Bearer valid-token")
            .send({ color: "#FFFFF" });

        expect(res3.status).toBe(400);
    });
});
