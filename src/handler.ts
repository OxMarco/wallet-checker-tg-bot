import { Context, InlineKeyboard } from "grammy";
import {
  generateMarkdownSummaryForDeFi,
  generateSummaryForTokens,
  getWalletBalance,
  getWalletDeFiPositions,
} from "./utils/moralis";
import { getUserChain, getUserWallet } from "./utils/db";
import { getUserState } from "./utils/state";
import { logger } from "./utils/logger";
import { getChainName, handleAskChain } from "./handlers/chain";
import { handleAskWallet, handleSetWallet } from "./handlers/wallet";

const callbackHandlers: any = {
  check_balance: handleCheckBalance,
  set_wallet: handleAskWallet,
  set_chain: handleAskChain,
};

export const menuKeyboard = new InlineKeyboard()
  .text("Check Balance", "check_balance")
  .row()
  .text("Set Chain", "set_chain")
  .text("Set Wallet", "set_wallet");

export async function handleMessage(ctx: Context) {
  if (!ctx.chat || !ctx.from) {
    await ctx.reply("Unable to retrieve chat information, please retry");
    return;
  }

  try {
    const userId = ctx.from.id;
    const userState = getUserState(userId);

    if (userState?.setWalletRequested) {
      await handleSetWallet(ctx);
    } else {
      await ctx.reply("Please select an option from the menu.");
    }
  } catch (error) {
    logger.error("Error in handleMessage:", error);
    await ctx.reply("An error occurred while processing your request");
  }
}

export async function handleButtonClick(ctx: Context) {
  if (!ctx.callbackQuery || !ctx.callbackQuery.data) {
    await ctx.reply("Unable to retrieve chat information, please retry");
    return;
  }

  try {
    const handler: any = callbackHandlers[ctx.callbackQuery.data];
    if (handler) {
      await ctx.answerCallbackQuery();
      await handler(ctx);
    } else {
      await ctx.reply("Unknown button clicked");
    }
  } catch (error) {
    logger.error("Error in handleButtonClick:", error);
    await ctx.reply("An error occurred while processing your request");
  }
}

export async function handleCheckBalance(ctx: Context) {
  if (!ctx.chat || !ctx.from) {
    await ctx.reply("Unable to retrieve chat information, please retry");
    return;
  }

  try {
    const userId = ctx.from.id;
    const wallet = await getUserWallet(userId);
    if (!wallet) {
      await ctx.reply("Please set your wallet first");
      return;
    }
    const chain = await getUserChain(userId);
    if (!chain) {
      await ctx.reply("Please set the desired chain first");
      return;
    }

    await ctx.reply(
      `Fetching data for *${wallet}* on *${getChainName(chain)}*...`,
      { parse_mode: "Markdown" },
    );

    const tokens = await getWalletBalance(chain, wallet);
    const tokenSummary = generateSummaryForTokens(tokens);
    const defi = await getWalletDeFiPositions(chain, wallet);
    const defiSummary = generateMarkdownSummaryForDeFi(defi);

    await ctx.reply("```\n" + tokenSummary + "```", { parse_mode: "Markdown" });
    await ctx.reply("```\n" + defiSummary + "```", { parse_mode: "Markdown" });
  } catch (error) {
    logger.error("Error in handleCheckBalance:", error);
    await ctx.reply("An error occurred while processing your request");
  }
}

export async function handleStart(ctx: Context) {
  if (!ctx.chat) {
    await ctx.reply("Unable to retrieve chat information, please retry");
    return;
  }

  try {
    const welcomeMessage = `
*Welcome to the Wallet Tracker TG Bot!*
With this bot, you can track your token portfolio and your DeFi strategies while maintaining full custody over your wallet.
Select an option below to start:
`;

    await ctx.api.unpinAllChatMessages(ctx.chat.id);
    const msg = await ctx.reply(welcomeMessage, {
      reply_markup: menuKeyboard,
      parse_mode: "Markdown",
    });
    await ctx.api.pinChatMessage(ctx.chat.id, msg.message_id);
  } catch (error) {
    logger.error("Error in handleStart:", error);
    await ctx.reply("An error occurred while processing your request");
  }
}

export async function handleShowMenu(ctx: Context) {
  if (!ctx.chat) {
    await ctx.reply("Unable to retrieve chat information, please retry");
    return;
  }

  try {
    await ctx.reply("Menu", {
      reply_markup: menuKeyboard,
      parse_mode: "Markdown",
    });
  } catch (error) {
    logger.error("Error in handleShowMenu:", error);
    await ctx.reply("An error occurred while processing your request");
  }
}

export async function handleShowInfo(ctx: Context) {
  if (!ctx.chat) {
    await ctx.reply("Unable to retrieve chat information, please retry");
    return;
  }

  try {
    await ctx.reply("This bot was developed by OxMarco");
  } catch (error) {
    logger.error("Error in handleShowInfo:", error);
    await ctx.reply("An error occurred while processing your request");
  }
}
