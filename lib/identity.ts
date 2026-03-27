import { DESO_IDENTITY_URL, DESO_NODE_URL } from "@/lib/env";
import { configure, identity } from "deso-protocol";

let configured = false;

function getNodeURI() {
  return DESO_NODE_URL.replace(/\/api\/v0\/?$/, "");
}

function ensureConfigured() {
  if (configured) return;

  configure({
    identityURI: DESO_IDENTITY_URL,
    nodeURI: getNodeURI(),
    spendingLimitOptions: {
      TransactionCountLimitMap: {
        SUBMIT_POST: "UNLIMITED",
      },
    },
  });

  configured = true;
}

function extractPublicKey(loginResult: unknown): string | null {
  const result = loginResult as {
    publicKey?: string;
    currentUser?: { publicKey?: string };
  };

  if (typeof result?.publicKey === "string") return result.publicKey;
  if (typeof result?.currentUser?.publicKey === "string") return result.currentUser.publicKey;

  const state = (identity as unknown as { getState?: () => { currentUser?: { publicKey?: string } } }).getState?.();
  const stateKey = state?.currentUser?.publicKey;

  return typeof stateKey === "string" ? stateKey : null;
}

export async function launchLogin(): Promise<string> {
  ensureConfigured();

  const loginResult = await identity.login();
  const publicKey = extractPublicKey(loginResult);

  if (!publicKey) {
    throw new Error("Unable to resolve DeSo public key from identity login result");
  }

  return publicKey;
}

export async function signTransaction(transactionHex: string): Promise<string> {
  ensureConfigured();

  const signedResult = (await identity.signTx(transactionHex)) as string | { signedTransactionHex?: string; txHex?: string };
  if (typeof signedResult === "string") return signedResult;

  const signedHex = signedResult?.signedTransactionHex || signedResult?.txHex;
  if (!signedHex) throw new Error("Identity did not return a signed transaction");

  return signedHex;
}

export async function submitSignedTransaction(transactionHex: string): Promise<{ TxnHashHex: string }> {
  ensureConfigured();
  const submitResult = (await identity.submitTx(transactionHex)) as string | { TxnHashHex?: string; txnHashHex?: string };
  if (typeof submitResult === "string") return { TxnHashHex: submitResult };

  const txnHashHex = submitResult?.TxnHashHex || submitResult?.txnHashHex;
  if (!txnHashHex) throw new Error("Identity did not return a transaction hash");

  return { TxnHashHex: txnHashHex };
}
