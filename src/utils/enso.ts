import config from "./configs";
import { logger } from "./logger";

const url = "https://api.enso.finance/api/v1";
const headers = {
  "Content-Type": "application/json",
  Authorization: config.ENSO_API_KEY,
};

export const quote = async (
  chainId: number,
  user: `0x${string}`,
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  amount: number,
) => {
  try {
    const params = new URLSearchParams({
      chainId: String(chainId),
      fromAddress: user,
      amountIn: String(amount),
      tokenIn,
      tokenOut,
    });
    const response = await fetch(`${url}/shortcuts/quote?${params}`, {
      method: "GET",
      headers: headers,
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    logger.error("Error:", error);
    throw error;
  }
};

export const execute = async (
  chainId: number,
  user: `0x${string}`,
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  amount: number,
  slippage: number,
) => {
  try {
    const params = new URLSearchParams({
      chainId: String(chainId),
      fromAddress: user,
      receiver: user,
      spender: user,
      amountIn: String(amount),
      slippage: String(slippage),
      tokenIn,
      tokenOut,
    });
    const response = await fetch(`${url}/shortcuts/route?${params}`, {
      method: "GET",
      headers: headers,
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    logger.error("Error:", error);
    throw error;
  }
};

export const getDescription = (data: any) => {
  if (!data?.route) return "Invalid action";

  const steps = data.route.map(
    (step: any) => `${step.action} on ${step.protocol}`,
  );
  const description = "I will " + steps.join(", then ") + ".";
  return description;
};
