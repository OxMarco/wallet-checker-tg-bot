import Moralis from "moralis";
import { AsciiTable3, AlignmentEnum } from "ascii-table3";

export const getWalletBalance = async (
  chainId: number,
  wallet: `0x${string}`,
) => {
   {
    const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: "0x" + chainId.toString(16),
      address: wallet,
    });

    return response.toJSON();
  }
};

export const getWalletDeFiPositions = async (
  chainId: number,
  wallet: `0x${string}`,
) => {
   {
    const response = await Moralis.EvmApi.wallets.getDefiPositionsSummary({
      chain: "0x" + chainId.toString(16),
      address: wallet,
    });

    return response.toJSON();
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
    const balanceFormatted = `$${Number(balance_usd).toFixed(2)}`;
    const apyFormatted = net_apy ? `${Number(net_apy * 100).toFixed(2)}%` : "N/A";
    table.addRow(protocol_name, balanceFormatted, apyFormatted);
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
      const valueFormatted = `$${Number(usd_value).toFixed(2)}`;
      const balanceFormatted = Number(balance_formatted).toFixed(4);
      table.addRow(symbol, balanceFormatted, valueFormatted);
    }
  });

  return table.toString();
};
