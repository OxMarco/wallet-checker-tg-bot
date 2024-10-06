import { Context } from "grammy";
import { isAddress } from "viem";
import { getUserState, updateUserState } from "../utils/state";
import { setUserData } from "../utils/db";
import { logger } from "../utils/logger";

export async function handleAskWallet(ctx: Context) {
  if (!ctx.chat || !ctx.from) {
    await ctx.reply("Unable to retrieve chat information, please retry");
    return;
  }

  try {
    await ctx.reply("Please input your wallet address", {
      reply_markup: { force_reply: true },
    });
    updateUserState(ctx.from.id, { setWalletRequested: true });
  } catch (error) {
    logger.error("Error in handleAskWallet:", error);
    await ctx.reply("An error occurred while processing your request");
  }
}

export async function handleSetWallet(ctx: Context) {
  if (!ctx.chat || !ctx.from || !ctx.message || !ctx.message.text) {
    await ctx.reply("Unable to retrieve chat information, please retry");
    return;
  }

  try {
    const userId = ctx.from.id;
    const userState = getUserState(userId);

    if (userState?.setWalletRequested) {
      const walletAddress = ctx.message.text.trim() || "";

      if (!isAddress(walletAddress)) {
        await ctx.reply("Invalid wallet address, please send it again", {
          reply_markup: { force_reply: true },
        });
        return;
      }

      updateUserState(userId, { setWalletRequested: false });
      await setUserData({ userId, wallet: walletAddress });
      await ctx.reply(`Wallet address set to: *${walletAddress}*`, {
        parse_mode: "Markdown",
      });
    } else {
      await ctx.reply("Please select an option from the menu.");
    }
  } catch (error) {
    logger.error("Error in handleSetWallet:", error);
    await ctx.reply("An error occurred while processing your request");
  }
}
