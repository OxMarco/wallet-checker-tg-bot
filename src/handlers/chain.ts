import { Context } from "grammy";
import { Menu } from "@grammyjs/menu";
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  mainnet,
  optimism,
  polygon,
  tron,
} from "viem/chains";
import { setUserData } from "../utils/db";
import { logger } from "../utils/logger";

export const getChainName = (chainId: number) => {
  if (chainId == mainnet.id) return mainnet.name;
  if (chainId == base.id) return base.name;
  if (chainId == arbitrum.id) return arbitrum.name;
  if (chainId == optimism.id) return optimism.name;
  if (chainId == polygon.id) return polygon.name;
  if (chainId == avalanche.id) return avalanche.name;
  if (chainId == bsc.id) return bsc.name;
  if (chainId == tron.id) return tron.name;
  else return "unknown chain";
};

export const chainMenu = new Menu("chainMenu")
  .text("Mainnet", (ctx) => setChain(ctx, mainnet.name, mainnet.id))
  .text("Base", (ctx) => setChain(ctx, base.name, base.id))
  .row()
  .text("Arbitrum", (ctx) => setChain(ctx, arbitrum.name, arbitrum.id))
  .text("Optimism", (ctx) => setChain(ctx, optimism.name, optimism.id))
  .row()
  .text("Polygon", (ctx) => setChain(ctx, polygon.name, polygon.id))
  .text("Avalanche", (ctx) => setChain(ctx, avalanche.name, avalanche.id))
  .row()
  .text("BSC", (ctx) => setChain(ctx, bsc.name, bsc.id))
  .text("Tron", (ctx) => setChain(ctx, tron.name, tron.id))
  .row();

export async function setChain(
  ctx: Context,
  chainName: string,
  chainId: number,
) {
  if (!ctx.chat || !ctx.from) {
    await ctx.reply("Unable to retrieve chat information, please retry");
    return;
  }

  const userId = ctx.from.id;
  await setUserData({ userId, chain: chainId });
  await ctx.reply(`Chain set to *${chainName}*`, { parse_mode: "Markdown" });
}

export async function handleAskChain(ctx: Context) {
  if (!ctx.chat || !ctx.from) {
    await ctx.reply("Unable to retrieve chat information, please retry");
    return;
  }

  try {
    await ctx.reply("Change default chain:", { reply_markup: chainMenu });
  } catch (err) {
    logger.error({ msg: "Error in handleAskChain:", err });
    await ctx.reply("An error occurred while processing your request");
  }
}
