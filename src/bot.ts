import { Bot } from "grammy";
import { limit } from "@grammyjs/ratelimiter";
import Moralis from "moralis";
import pino from "pino";
import {
  handleShowMenu,
  handleButtonClick,
  handleMessage,
  handleStart,
  handleCheckBalance,
  handleShowInfo,
} from "./handler";
import config from "./utils/configs";
import { initializeDatabase } from "./utils/db";
import { chainMenu, handleAskChain } from "./handlers/chain";
import { handleAskWallet } from "./handlers/wallet";
import { logger } from "./utils/logger";

async function main() {
  await Moralis.start({
    apiKey: config.MORALIS_API_KEY,
  });

  await initializeDatabase();

  const bot = new Bot(config.TELEGRAM_BOT_TOKEN);
  bot.use(
    limit({
      // Allow only 3 messages to be handled every 2 seconds
      timeFrame: 2000,
      limit: 3,

      onLimitExceeded: async (ctx) => {
        await ctx.reply("Too many requests, slow down!");
      },

      keyGenerator: (ctx) => {
        return ctx.from?.id.toString();
      },
    }),
  );
  bot.use(chainMenu);

  bot.command("start", handleStart);
  bot.command("menu", handleShowMenu);
  bot.command("balance", handleCheckBalance);
  bot.command("info", handleShowInfo);
  bot.command("set_wallet", handleAskWallet);
  bot.command("set_chain", handleAskChain);

  bot.on("callback_query:data", handleButtonClick);
  bot.on("message:text", handleMessage);

  process.once("SIGINT", () => bot.stop());
  process.once("SIGTERM", () => bot.stop());

  bot.start();
}

main().catch((err) => {
  logger.error("Error in the bot operation:", err);
});
