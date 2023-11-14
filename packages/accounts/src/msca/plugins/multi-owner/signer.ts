import {
  SignerSchema,
  type SignTypedDataParams,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { toBytes } from "viem";
import { z } from "zod";
import { MultiOwnerPlugin, zMultiOwnerPluginParams } from "./plugin.js";

export const zMultiOwnerPluginSignerParams = z
  .object({
    signer: SignerSchema,
  })
  .and(zMultiOwnerPluginParams);

export type MultiOwnerPluginSignerParams = z.infer<
  typeof zMultiOwnerPluginSignerParams
>;

export class MultiOwnerPluginSigner
  implements SmartAccountSigner<SmartAccountSigner>
{
  signerType: string;
  inner: SmartAccountSigner<any>;
  plugin: MultiOwnerPlugin;

  constructor(params_: MultiOwnerPluginSignerParams) {
    const { signer, ...pluginParams } =
      zMultiOwnerPluginSignerParams.parse(params_);
    this.signerType = `multi-owner:${signer.signerType}`;
    this.inner = signer;
    this.plugin = new MultiOwnerPlugin(pluginParams);
  }

  // This returns the address of the current owner, not all owners
  getAddress: () => Promise<`0x${string}`> = () => {
    return this.inner.getAddress();
  };

  /**
   * This format will only work for validating user op signatures
   * 1271 validation is handled differently, so signatures for 1271 validation
   * should use the method `signMessageFor1271`
   *
   * @param msg the UO hash
   * @returns a Promise containing the signature in Hex format
   */
  signMessage: (msg: string | Uint8Array) => Promise<`0x${string}`> = async (
    msg
  ) => {
    return this.inner.signMessage(msg);
  };

  /**
   * This format is required for all 1271 validation
   *
   * @param msg the message being signed for personal_sign
   * @returns a Promise containing the signature in Hex format
   */
  signMessageFor1271: (msg: string | Uint8Array) => Promise<`0x${string}`> =
    async (msg) => {
      return this.signTypedData({
        domain: await this.plugin.getDomainSeparator(),
        types: {
          ERC6900Message: [{ name: "message", type: "bytes" }],
        },
        message: {
          ERC6900Message: {
            message: typeof msg === "string" ? toBytes(msg) : msg,
          },
        },
        primaryType: "ERC6900Message",
      });
    };

  signTypedData: (params: SignTypedDataParams) => Promise<`0x${string}`> = (
    params
  ) => {
    return this.inner.signTypedData(params);
  };
}
