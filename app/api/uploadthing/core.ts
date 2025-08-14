import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  menuImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      // Return the file URL; caller will store it in Convex
      return { url: (file as any).ufsUrl ?? (file as any).url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;


