import Moralis from "moralis";
import { AsciiTable3, AlignmentEnum } from "ascii-table3";
import { logger } from "./logger";

export const getWalletBalance = async (
  chainId: number,
  wallet: `0x${string}`,
) => {
  try {
    const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: "0x" + chainId.toString(16),
      address: wallet,
    });

    return response.toJSON();
  } catch (error) {
    logger.error(error);
    return null;
  }
};

export const getWalletDeFiPositions = async (
  chainId: number,
  wallet: `0x${string}`,
) => {
  try {
    const response = await Moralis.EvmApi.wallets.getDefiPositionsSummary({
      chain: "0x" + chainId.toString(16),
      address: wallet,
    });

    return response.toJSON();
  } catch (error) {
    logger.error(error);
    return null;
  }
};

export const generateMarkdownSummaryForDeFi = (positions: any): string => {
  if (!positions || positions.length == 0) {
    return "No DeFi positions";
  }

  let table = new AsciiTable3("DeFi Portfolio");
  table.setHeading("Protocol", "Balance", "APY");
  table.setAlign(2, AlignmentEnum.RIGHT);

  positions.forEach((position: any) => {
    const {
      protocol_name,
      position: { label, balance_usd },
      account_data: { net_apy },
    } = position;
    const balanceFormatted = `$${balance_usd.toFixed(2)}`;
    const apyFormatted = net_apy ? `${(net_apy * 100).toFixed(2)}%` : "N/A";
    table.addRow(protocol_name + ' ' + label, balanceFormatted, apyFormatted);
  });

  return table.toString();
};

export const generateSummaryForTokens = (data: any): string => {
  if (!data || !data?.result || data.result.length == 0) {
    return "No tokens held";
  }

  let table = new AsciiTable3("Token Portfolio");
  table.setHeading("Token", "Balance", "Value");
  table.setAlign(2, AlignmentEnum.RIGHT);

  data.result.forEach((token: any) => {
    const { symbol, balance_formatted, usd_value } = token;
    if (usd_value !== null) {
      const valueFormatted = `$${usd_value.toFixed(2)}`;
      table.addRow(symbol, balance_formatted.toFixed(4), valueFormatted);
    }
  });

  return table.toString();
};
