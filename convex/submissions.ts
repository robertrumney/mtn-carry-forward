import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const create = mutation({
  args: {
    originalPhotoId: v.id("_storage"),
    compositedImageId: v.id("_storage"),
    heroName: v.string(),
    heroSlug: v.string(),
    permissionGranted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const originalPhotoUrl = await ctx.storage.getUrl(args.originalPhotoId);
    const compositedImageUrl = await ctx.storage.getUrl(args.compositedImageId);

    return await ctx.db.insert("submissions", {
      ...args,
      createdAt: Date.now(),
      originalPhotoUrl: originalPhotoUrl ?? undefined,
      compositedImageUrl: compositedImageUrl ?? undefined,
    });
  },
});

export const list = query({
  args: {
    permissionFilter: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let submissions = await ctx.db.query("submissions").order("desc").collect();

    if (args.permissionFilter !== undefined) {
      submissions = submissions.filter(
        (s) => s.permissionGranted === args.permissionFilter
      );
    }

    // Refresh storage URLs (they expire)
    return Promise.all(
      submissions.map(async (sub) => ({
        ...sub,
        originalPhotoUrl: sub.originalPhotoId
          ? (await ctx.storage.getUrl(sub.originalPhotoId)) ?? undefined
          : undefined,
        compositedImageUrl: sub.compositedImageId
          ? (await ctx.storage.getUrl(sub.compositedImageId)) ?? undefined
          : undefined,
      }))
    );
  },
});

export const stats = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("submissions").collect();
    const permitted = all.filter((s) => s.permissionGranted).length;
    return {
      total: all.length,
      permitted,
      notPermitted: all.length - permitted,
    };
  },
});

export const deleteSubmission = mutation({
  args: {
    id: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.id);
    if (submission) {
      // Delete stored files
      if (submission.originalPhotoId) {
        await ctx.storage.delete(submission.originalPhotoId);
      }
      if (submission.compositedImageId) {
        await ctx.storage.delete(submission.compositedImageId);
      }
      await ctx.db.delete(args.id);
    }
  },
});
