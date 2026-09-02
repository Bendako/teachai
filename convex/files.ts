import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

const disabled = () => {
  throw new ConvexError("Legacy public file storage function disabled");
};

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: disabled,
});

export const getFileUrl = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: disabled,
});

export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.null(),
  handler: disabled,
});
