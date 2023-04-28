import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "~/env.mjs";

export const showsRouter = createTRPCRouter({
  addTVShow: publicProcedure
    .input(
      z.object({
        title: z.string(),
        imageUrl: z.string(),
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
          imageUrl: input.imageUrl,
        },
      });

      return {
        ...tvShowObject,
        ...prismaObject,
      };
    }),
  listTVShows: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const shows = await prisma.show.findMany({
      include: {
        seasons: true,
      },
    });

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
          title: {
            contains: input.title,
          },
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

      const seasons = await prisma.season.findMany({
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
  addSeason: publicProcedure
    .input(
      z.object({
        showId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const show = await ctx.prisma.show.findUnique({
        where: {
          id: input.showId,
        },
      });
      if (!show) return {};

      const season = await ctx.prisma.season.create({
        data: {
          showId: show.id,
        },
      });

      const seasonCount = await ctx.prisma.season.count();

      await ctx.s3.putObject({
        Bucket: env.BUCKET_NAME,
        Key: `tv-shows/${show.title}/se-${seasonCount}/`,
      });

      return season;
    }),
});
