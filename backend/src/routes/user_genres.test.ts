import { describe, it, expect, beforeAll, afterAll, beforeEach, jest, mock } from "bun:test";
import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import userRoutes from "./user.routes";
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
app.use("/api/user", userRoutes);

describe("User Routes - Genres", () => {
    beforeAll(async () => {
        const uri = "mongodb://localhost:27017/streamtrack_test";
        try {
            await mongoose.connect(uri);
            console.log("Connected to test DB");
        } catch (e) {
            console.error("DB Connection failed", e);
        }
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        // Create a test user
        await User.create({
            firebaseUid: "test-uid",
            email: "test@example.com",
            genres: [28, 12] // Action, Adventure
        });
    });

    it("should get user genres", async () => {
        const res = await request(app)
            .get("/api/user/genres")
            .set("Authorization", "Bearer valid-token");

        expect(res.status).toBe(200);
        expect(res.body.genres).toBeInstanceOf(Array);
        expect(res.body.genres).toHaveLength(2);
        expect(res.body.genres).toContain(28);
        expect(res.body.genres).toContain(12);
    });

    it("should update user genres", async () => {
        const newGenres = [35, 18]; // Comedy, Drama

        const res = await request(app)
            .put("/api/user/genres")
            .set("Authorization", "Bearer valid-token")
            .send({ genres: newGenres });

        expect(res.status).toBe(200);
        expect(res.body.genres).toHaveLength(2);
        expect(res.body.genres).toContain(35);
        expect(res.body.genres).toContain(18);

        const user = await User.findOne({ firebaseUid: "test-uid" });
        expect(user?.genres).toHaveLength(2);
        expect(user?.genres).toContain(35);
    });

    it("should reject invalid genres format", async () => {
        const res = await request(app)
            .put("/api/user/genres")
            .set("Authorization", "Bearer valid-token")
            .send({ genres: "not-an-array" });

        expect(res.status).toBe(400);
    });

    it("should reject non-number genres", async () => {
        const res = await request(app)
            .put("/api/user/genres")
            .set("Authorization", "Bearer valid-token")
            .send({ genres: [28, "12"] });

        expect(res.status).toBe(400);
    });
});
