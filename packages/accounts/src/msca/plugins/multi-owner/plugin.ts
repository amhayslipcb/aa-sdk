import type { TypedDataDomain } from "viem";

export class MultiOwnerPlugin {
  pluginAddress: string;

  constructor(pluginAddress: string) {
    this.pluginAddress = pluginAddress;
  }

  // TODO: need to call the plugin contract's view method for the domain separator
  async getDomainSeparator(): Promise<TypedDataDomain> {
    return {};
  }

  // TODO: Support public methods listed in plugin contract definition (ask moldy for specifics)
}
