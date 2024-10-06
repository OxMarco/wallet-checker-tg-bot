import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["TELEGRAM_BOT_TOKEN", "MORALIS_API_KEY"] as const;

const config: Record<string, string> = {} as Record<string, string>;

requiredEnvVars.forEach((env) => {
  const value = process.env[env];
  if (!value) {
    throw new Error(`Missing environment variable: ${env}`);
  }
  config[env] = value;
});

export default config;
