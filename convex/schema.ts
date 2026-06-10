import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  submissions: defineTable({
    originalPhotoId: v.id("_storage"),
    compositedImageId: v.id("_storage"),
    heroName: v.string(),
    heroSlug: v.string(),
    permissionGranted: v.boolean(),
    createdAt: v.number(),
    originalPhotoUrl: v.optional(v.string()),
    compositedImageUrl: v.optional(v.string()),
  }),
});
