import type { Chain } from "viem";
import { z } from "zod";
import { getChain } from "./index.js";

export const ChainSchema = z.custom<Chain>((chain) => {
  if (
    chain == null ||
    !(typeof chain === "object") ||
    !("id" in chain) ||
    typeof chain.id !== "number"
  ) {
    return false;
  }

  try {
    return getChain(chain.id) !== undefined;
  } catch {
    return false;
  }
});

export const PercentageSchema = z.object({
  /**
   * Percent value between 1 and 1000 inclusive for maxPriorityFeePerGas estimate added buffer.
   * maxPriorityFeePerGasBid is set to the max between the buffer "added" priority fee estimate and
   * the minPriorityFeePerBid (default: 33)
   */
  percentage: z.number().min(1).max(1000).default(33),
});
