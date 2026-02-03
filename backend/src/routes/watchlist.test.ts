import { describe, it, expect, beforeAll, afterAll, beforeEach, jest, mock } from "bun:test";
import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import watchlistRoutes from "./watchlist.routes";
import { User, IUser } from "../models/User";
// import { authMiddleware } from "../middleware/auth.middleware";

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
app.use("/api/watchlist", watchlistRoutes);

describe("Watchlist Routes", () => {
    // let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        // mongoServer = await MongoMemoryServer.create();
        // const uri = mongoServer.getUri();
        const uri = "mongodb://localhost:27017/streamtrack_test";
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        // await mongoServer.stop();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        // Create a test user
        await User.create({
            firebaseUid: "test-uid",
            email: "test@example.com",
            watchlist: []
        });
    });

    it("should add an item to the watchlist", async () => {
        const newItem = {
            contentId: "123",
            title: "Test Movie",
            type: "movie",
            posterPath: "/path.jpg"
        };

        const res = await request(app)
            .post("/api/watchlist")
            .set("Authorization", "Bearer valid-token")
            .send(newItem);

        expect(res.status).toBe(201);
        expect(res.body.item.contentId).toBe("123");
        expect(res.body.item.status).toBe("want");

        const user = await User.findOne({ firebaseUid: "test-uid" });
        expect(user?.watchlist).toHaveLength(1);
        expect(user?.watchlist[0].contentId).toBe("123");
    });

    it("should get the watchlist", async () => {
        // Seed
        await User.findOneAndUpdate(
            { firebaseUid: "test-uid" },
            {
                $push: {
                    watchlist: {
                        contentId: "123",
                        title: "Test Movie",
                        type: "movie",
                        status: "want",
                        addedAt: new Date()
                    }
                }
            }
        );

        const res = await request(app)
            .get("/api/watchlist")
            .set("Authorization", "Bearer valid-token");
        expect(res.status).toBe(200);
        expect(res.body.watchlist).toHaveLength(1);
        expect(res.body.watchlist[0].contentId).toBe("123");
    });

    it("should update a watchlist item", async () => {
        // Seed
        await User.findOneAndUpdate(
            { firebaseUid: "test-uid" },
            {
                $push: {
                    watchlist: {
                        contentId: "123",
                        title: "Test Movie",
                        type: "movie",
                        status: "want",
                        addedAt: new Date()
                    }
                }
            }
        );

        const res = await request(app)
            .put("/api/watchlist/123")
            .set("Authorization", "Bearer valid-token")
            .send({ status: "watched", rating: 8 });

        expect(res.status).toBe(200);
        expect(res.body.item.status).toBe("watched");
        expect(res.body.item.rating).toBe(8);

        const user = await User.findOne({ firebaseUid: "test-uid" });
        const item = user?.watchlist.find(i => i.contentId === "123");
        expect(item?.status).toBe("watched");
    });

    it("should delete a watchlist item", async () => {
        // Seed
        await User.findOneAndUpdate(
            { firebaseUid: "test-uid" },
            {
                $push: {
                    watchlist: {
                        contentId: "123",
                        title: "Test Movie",
                        type: "movie",
                        status: "want",
                        addedAt: new Date()
                    }
                }
            }
        );

        const res = await request(app)
            .delete("/api/watchlist/123")
            .set("Authorization", "Bearer valid-token");
        expect(res.status).toBe(200);

        const user = await User.findOne({ firebaseUid: "test-uid" });
        expect(user?.watchlist).toHaveLength(0);
    });

    it("should get watchlist stats", async () => {
        // Seed multiple
        await User.findOneAndUpdate(
            { firebaseUid: "test-uid" },
            {
                $push: {
                    watchlist: {
                        $each: [
                            { contentId: "1", title: "M1", type: "movie", status: "want", addedAt: new Date() },
                            { contentId: "2", title: "S1", type: "tv", status: "watching", addedAt: new Date() },
                            { contentId: "3", title: "M2", type: "movie", status: "watched", addedAt: new Date() }
                        ]
                    }
                }
            }
        );

        const res = await request(app)
            .get("/api/watchlist/stats")
            .set("Authorization", "Bearer valid-token");
        expect(res.status).toBe(200);
        expect(res.body.stats.total).toBe(3);
        expect(res.body.stats.byStatus.want).toBe(1);
        expect(res.body.stats.byStatus.watching).toBe(1);
        expect(res.body.stats.byStatus.watched).toBe(1);
        expect(res.body.stats.byType.movie).toBe(2);
        expect(res.body.stats.byType.tv).toBe(1);
    });
});
