import {
  createPublicErc4337ClientSchema,
  type PublicErc4337Client,
} from "@alchemy/aa-core";
import { Address as zAddress } from "abitype/zod";
import {
  getContract,
  type Address,
  type GetContractReturnType,
  type HttpTransport,
  type PublicClient,
  type TypedDataDomain,
} from "viem";
import { z } from "zod";
import { MultiOwnerPluginAbi } from "../../abis/MultiOwnerPlugin.js";

export const zMultiOwnerPluginParams = z.object({
  client: createPublicErc4337ClientSchema<HttpTransport>(),
  pluginAddress: zAddress,
});

export type MultiOwnerPluginParams = z.input<typeof zMultiOwnerPluginParams>;

export class MultiOwnerPlugin {
  pluginAddress: Address;
  client: PublicErc4337Client<HttpTransport>;
  contract: GetContractReturnType<
    typeof MultiOwnerPluginAbi,
    PublicClient<HttpTransport>
  >;

  constructor(params_: MultiOwnerPluginParams) {
    const params = zMultiOwnerPluginParams.parse(params_);
    this.pluginAddress = params.pluginAddress;
    this.client = params.client;

    this.contract = getContract({
      address: this.pluginAddress,
      publicClient: this.client as PublicClient<HttpTransport>,
      abi: MultiOwnerPluginAbi,
    });
  }

  async getDomainSeparator(): Promise<TypedDataDomain> {
    const [, name, version, chainId, verifyingContract, salt] =
      await this.contract.read.eip712Domain();

    return {
      chainId: Number(chainId),
      name,
      salt,
      verifyingContract,
      version,
    };
  }

  // TODO: Support public methods listed in plugin contract definition (ask moldy for specifics)
}
