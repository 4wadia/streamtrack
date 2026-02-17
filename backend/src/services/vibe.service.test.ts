import { describe, it, expect, beforeEach, mock } from "bun:test";
import { vibeService, VIBE_MAP, GENRE_IDS, type VibeDefinition } from "./vibe.service";

// Mock the tmdbService
mock.module("./tmdb.service", () => ({
    tmdbService: {
        getProviderTmdbIds: (serviceIds: string[]) => {
            // Map service IDs to mock TMDB provider IDs
            const mapping: Record<string, number> = {
                netflix: 8,
                prime: 119,
                hotstar: 122
            };
            return serviceIds.map(id => mapping[id]).filter(Boolean);
        },
        discover: async (type: string, options: any) => {
            // Return mock content based on genres
            return [
                {
                    id: "movie-1",
                    tmdbId: 1,
                    type: "movie",
                    title: "Mock Movie 1",
                    overview: "A mock movie",
                    posterPath: "/poster1.jpg",
                    backdropPath: "/backdrop1.jpg",
                    releaseDate: "2024-01-01",
                    rating: 8.0,
                    voteCount: 1000,
                    genreIds: options.genres || []
                },
                {
                    id: "movie-2",
                    tmdbId: 2,
                    type: "movie",
                    title: "Mock Movie 2",
                    overview: "Another mock movie",
                    posterPath: "/poster2.jpg",
                    backdropPath: "/backdrop2.jpg",
                    releaseDate: "2024-02-01",
                    rating: 7.5,
                    voteCount: 500,
                    genreIds: options.genres || []
                }
            ];
        }
    },
    ContentItem: {}
}));

describe("VibeService", () => {
    describe("getVibes", () => {
        it("should return all 6 vibes", () => {
            const vibes = vibeService.getVibes();

            expect(vibes).toHaveLength(6);
            expect(vibes.map(v => v.id).sort()).toEqual([
                "cozy", "dark", "funny", "intense", "mindless", "thoughtful"
            ].sort());
        });

        it("should have required properties on each vibe", () => {
            const vibes = vibeService.getVibes();

            for (const vibe of vibes) {
                expect(vibe.id).toBeDefined();
                expect(vibe.name).toBeDefined();
                expect(vibe.icon).toBeDefined();
                expect(vibe.color).toBeDefined();
                expect(vibe.description).toBeDefined();
                expect(vibe.genres).toBeInstanceOf(Array);
                expect(vibe.genres.length).toBeGreaterThan(0);
            }
        });
    });

    describe("getVibe", () => {
        it("should return correct vibe by ID", () => {
            const cozyVibe = vibeService.getVibe("cozy");

            expect(cozyVibe).toBeDefined();
            expect(cozyVibe?.id).toBe("cozy");
            expect(cozyVibe?.name).toBe("Cozy");
            expect(cozyVibe?.icon).toBe("coffee");
            expect(cozyVibe?.genres).toContain(GENRE_IDS.ROMANCE);
            expect(cozyVibe?.genres).toContain(GENRE_IDS.COMEDY);
        });

        it("should return undefined for unknown vibe", () => {
            const unknownVibe = vibeService.getVibe("nonexistent");

            expect(unknownVibe).toBeUndefined();
        });

        it("should return all vibes correctly by ID", () => {
            const vibeIds = ["cozy", "intense", "mindless", "thoughtful", "dark", "funny"];

            for (const id of vibeIds) {
                const vibe = vibeService.getVibe(id);
                expect(vibe).toBeDefined();
                expect(vibe?.id).toBe(id);
            }
        });
    });

    describe("discoverByVibe", () => {
        it("should return results with vibe for valid vibe ID", async () => {
            const result = await vibeService.discoverByVibe("intense", ["netflix"]);

            expect(result.vibe).toBeDefined();
            expect(result.vibe?.id).toBe("intense");
            expect(result.results).toBeInstanceOf(Array);
            expect(result.results.length).toBeGreaterThan(0);
        });

        it("should return empty results for unknown vibe", async () => {
            const result = await vibeService.discoverByVibe("unknown-vibe", ["netflix"]);

            expect(result.vibe).toBeUndefined();
            expect(result.results).toEqual([]);
        });

        it("should work with different content types", async () => {
            const movieResult = await vibeService.discoverByVibe("cozy", [], "movie");
            const tvResult = await vibeService.discoverByVibe("cozy", [], "tv");

            expect(movieResult.results).toBeDefined();
            expect(tvResult.results).toBeDefined();
        });
    });

    describe("VIBE_MAP configuration", () => {
        it("cozy vibe should exclude horror and thriller", () => {
            const cozy = VIBE_MAP.cozy;

            expect(cozy.excludeGenres).toBeDefined();
            expect(cozy.excludeGenres).toContain(GENRE_IDS.HORROR);
            expect(cozy.excludeGenres).toContain(GENRE_IDS.THRILLER);
        });

        it("intense vibe should include action and thriller", () => {
            const intense = VIBE_MAP.intense;

            expect(intense.genres).toContain(GENRE_IDS.ACTION);
            expect(intense.genres).toContain(GENRE_IDS.THRILLER);
        });

        it("mindless vibe should have max runtime limit", () => {
            const mindless = VIBE_MAP.mindless;

            expect(mindless.maxRuntime).toBeDefined();
            expect(mindless.maxRuntime).toBe(100);
        });

        it("all vibes should have valid color hex codes", () => {
            const hexRegex = /^#[0-9a-fA-F]{6}$/;

            for (const vibe of Object.values(VIBE_MAP)) {
                expect(hexRegex.test(vibe.color)).toBe(true);
            }
        });
    });
});
