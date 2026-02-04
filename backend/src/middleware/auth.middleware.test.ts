import { describe, it, expect, beforeEach, mock } from "bun:test";
import type { Response, NextFunction } from "express";
import { authMiddleware, type AuthRequest } from "./auth.middleware";

// Track mock behavior
let mockVerifyResult: { uid: string; email?: string } | null = null;
let mockShouldThrow = false;

// Mock firebase service
mock.module("../services/firebase.service", () => ({
    verifyIdToken: async (token: string) => {
        if (mockShouldThrow) {
            throw new Error("Firebase verification error");
        }
        return mockVerifyResult;
    },
    initializeFirebase: () => { }
}));

describe("AuthMiddleware", () => {
    let mockReq: Partial<AuthRequest>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let statusCode: number;
    let jsonResponse: any;

    beforeEach(() => {
        // Reset mocks
        mockVerifyResult = { uid: "test-uid", email: "test@example.com" };
        mockShouldThrow = false;
        statusCode = 0;
        jsonResponse = null;

        mockReq = {
            headers: {}
        };

        mockRes = {
            status: (code: number) => {
                statusCode = code;
                return mockRes as Response;
            },
            json: (data: any) => {
                jsonResponse = data;
                return mockRes as Response;
            }
        };

        mockNext = () => { };
    });

    it("should authenticate with valid token and set req.user", async () => {
        mockReq.headers = { authorization: "Bearer valid-token" };
        mockVerifyResult = { uid: "user-123", email: "user@test.com" };
        let nextCalled = false;
        mockNext = () => { nextCalled = true; };

        await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(nextCalled).toBe(true);
        expect(mockReq.user).toBeDefined();
        expect(mockReq.user?.uid).toBe("user-123");
        expect(mockReq.user?.email).toBe("user@test.com");
    });

    it("should return 401 when Authorization header is missing", async () => {
        mockReq.headers = {};

        await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(statusCode).toBe(401);
        expect(jsonResponse.error).toContain("Authorization header");
    });

    it("should return 401 when Authorization header does not start with Bearer", async () => {
        mockReq.headers = { authorization: "Basic some-token" };

        await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(statusCode).toBe(401);
        expect(jsonResponse.error).toContain("Authorization header");
    });

    it("should return 401 when token is empty after Bearer", async () => {
        mockReq.headers = { authorization: "Bearer " };

        await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(statusCode).toBe(401);
        expect(jsonResponse.error).toBe("No token provided");
    });

    it("should return 401 when token verification returns null", async () => {
        mockReq.headers = { authorization: "Bearer invalid-token" };
        mockVerifyResult = null;

        await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(statusCode).toBe(401);
        expect(jsonResponse.error).toBe("Invalid or expired token");
    });

    it("should return 401 when token verification throws an error", async () => {
        mockReq.headers = { authorization: "Bearer bad-token" };
        mockShouldThrow = true;

        await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(statusCode).toBe(401);
        expect(jsonResponse.error).toBe("Authentication failed");
    });

    it("should handle user without email", async () => {
        mockReq.headers = { authorization: "Bearer valid-token" };
        mockVerifyResult = { uid: "user-no-email" };
        let nextCalled = false;
        mockNext = () => { nextCalled = true; };

        await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(nextCalled).toBe(true);
        expect(mockReq.user?.uid).toBe("user-no-email");
        expect(mockReq.user?.email).toBeUndefined();
    });
});
