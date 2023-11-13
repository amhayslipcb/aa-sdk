import {
  WalletClientSigner,
  type SignTypedDataParams,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import { Web3Auth } from "@web3auth/modal";
import { createWalletClient, custom, type Hash } from "viem";
import type {
  Web3AuthAuthenticationParams,
  Web3AuthUserInfo,
} from "./types.js";

export class Web3AuthSigner
  implements
    SmartAccountAuthenticator<
      Web3AuthAuthenticationParams,
      Web3AuthUserInfo,
      Web3Auth
    >
{
  inner: Web3Auth;
  private signer: WalletClientSigner | undefined;

  constructor({ inner }: { inner: Web3Auth }) {
    this.inner = inner;
  }

  get signerType() {
    return "web3auth";
  }

  getAddress = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    const address = await this.signer.getAddress();
    if (address == null) throw new Error("No address found");

    return address as Hash;
  };

  signMessage = async (msg: Uint8Array | string) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signMessage(msg);
  };

  signTypedData = (params: SignTypedDataParams) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signTypedData(params);
  };

  authenticate = async (params: Web3AuthAuthenticationParams) => {
    await params.initModal();
    await params.connect();

    if (this.inner.provider == null) throw new Error("No provider found");

    this.signer = new WalletClientSigner(
      createWalletClient({
        transport: custom(this.inner.provider),
      }),
      this.signerType
    );

    return this.inner.getUserInfo();
  };

  getAuthDetails = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.inner.getUserInfo();
  };
}