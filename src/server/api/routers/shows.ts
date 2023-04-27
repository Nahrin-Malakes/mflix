import { z } from "zod";
import { PutObjectCommand, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "~/env.mjs";

export const showsRouter = createTRPCRouter({
  getObjects: publicProcedure.query(async ({ ctx }) => {
    const { s3 } = ctx;

    const listObjectsOutput = await s3.listObjectsV2({
      Bucket: env.BUCKET_NAME,
    });

    return listObjectsOutput.Contents ?? [];
  }),
  getStandardUploadPresignedUrl: publicProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { key } = input;
      const { s3 } = ctx;

      const putObjectCommand = new PutObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: key,
      });

      return await getSignedUrl(s3, putObjectCommand);
    }),
  getMultipartUploadPresignedUrl: publicProcedure
    .input(z.object({ key: z.string(), filePartTotal: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { key, filePartTotal } = input;
      const { s3 } = ctx;

      const uploadId = (
        await s3.createMultipartUpload({
          Bucket: env.BUCKET_NAME,
          Key: key,
        })
      ).UploadId;

      if (!uploadId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create multipart upload",
        });
      }

      const urls: Promise<{ url: string; partNumber: number }>[] = [];

      for (let i = 1; i <= filePartTotal; i++) {
        const uploadPartCommand = new UploadPartCommand({
          Bucket: env.BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          PartNumber: i,
        });

        const url = getSignedUrl(s3, uploadPartCommand).then((url) => ({
          url,
          partNumber: i,
        }));

        urls.push(url);
      }

      return {
        uploadId,
        urls: await Promise.all(urls),
      };
    }),
  completeMultipartUpload: publicProcedure
    .input(
      z.object({
        key: z.string(),
        uploadId: z.string(),
        parts: z.array(
          z.object({
            ETag: z.string(),
            PartNumber: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { key, uploadId, parts } = input;
      const { s3 } = ctx;

      const completeMultipartUploadOutput = await s3.completeMultipartUpload({
        Bucket: env.BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
      });
      return completeMultipartUploadOutput;
    }),
  createTVSshow: publicProcedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { s3, prisma } = ctx;

      const tvShowObject = await s3.putObject({
        Bucket: env.BUCKET_NAME,
        Key: `tv-shows/${input.title}/`,
      });

      const prismaObject = await prisma.show.create({
        data: {
          title: input.title,
        },
      });

      return {
        ...tvShowObject,
        ...prismaObject,
      };
    }),
  listTVShows: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const shows = await prisma.show.findMany();

    return shows;
  }),
  getShow: publicProcedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const show = await prisma.show.findFirst({
        where: {
          title: input.title,
        },
        include: {
          seasons: {
            include: {
              episodes: true,
            },
          },
        },
      });
      if (!show) return null;

      const seasons = await prisma.season.count({
        where: {
          showId: show.id,
        },
      });

      return {
        show,
        seasons,
      };
    }),
  getEpisodesOfSeason: publicProcedure
    .input(
      z.object({
        showId: z.string(),
        seasonId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const show = await ctx.prisma.show.findUnique({
        where: {
          id: input.showId,
        },
      });
      if (!show) return null;

      const season = await ctx.prisma.season.findUnique({
        where: {
          id: input.seasonId,
        },
        include: {
          episodes: true,
        },
      });
      if (!season) return null;

      return season.episodes;
    }),
  getEpisode: publicProcedure
    .input(
      z.object({
        episodeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const episode = await ctx.prisma.episode.findUnique({
        where: {
          id: input.episodeId,
        },
      });
      if (!episode) return null;

      return episode;
    }),
});
