import { DESO_IDENTITY_URL, DESO_NODE_URL } from "@/lib/env";
import { configure, identity } from "deso-protocol";

let configured = false;

function getNodeURI() {
  return DESO_NODE_URL.replace(/\/api\/v0\/?$/, "");
}

function getIdentityState() {
  return (identity as unknown as { getState?: () => { currentUser?: { publicKey?: string } } }).getState?.();
}

function keyFromSnapshot(snapshot: unknown): string | null {
  const result = snapshot as { currentUser?: { publicKey?: string }; publicKey?: string };
  if (typeof result?.publicKey === "string") return result.publicKey;
  if (typeof result?.currentUser?.publicKey === "string") return result.currentUser.publicKey;

  const stateKey = getIdentityState()?.currentUser?.publicKey;
  return typeof stateKey === "string" ? stateKey : null;
}

function configureIdentity() {
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

export async function initIdentity() {
  const firstConfigure = !configured;
  configureIdentity();

  if (firstConfigure) {
    await identity.snapshot();
  }
}

export async function getCurrentIdentityPublicKey(): Promise<string | null> {
  await initIdentity();
  const snapshot = await identity.snapshot();
  return keyFromSnapshot(snapshot);
}

export async function launchLogin(): Promise<string> {
  await initIdentity();

  const loginResult = await identity.login({ getFreeDeso: true, derivedKeyLogin: true });
  const snapshot = await identity.snapshot();

  const result = loginResult as { publicKey?: string; currentUser?: { publicKey?: string } };
  const publicKey = result.publicKey || result.currentUser?.publicKey || keyFromSnapshot(snapshot);

  if (!publicKey) {
    throw new Error("Unable to resolve DeSo public key from identity login result");
  }

  return publicKey;
}

export async function logoutIdentity(): Promise<void> {
  await initIdentity();
  await identity.logout();
}

export async function signTransaction(transactionHex: string): Promise<string> {
  await initIdentity();

  const signedResult = (await identity.signTx(transactionHex)) as string | { signedTransactionHex?: string; txHex?: string };
  if (typeof signedResult === "string") return signedResult;

  const signedHex = signedResult?.signedTransactionHex || signedResult?.txHex;
  if (!signedHex) throw new Error("Identity did not return a signed transaction");

  return signedHex;
}

export async function submitSignedTransaction(transactionHex: string): Promise<{ TxnHashHex: string }> {
  await initIdentity();
  const submitResult = (await identity.submitTx(transactionHex)) as string | { TxnHashHex?: string; txnHashHex?: string };
  if (typeof submitResult === "string") return { TxnHashHex: submitResult };

  const txnHashHex = submitResult?.TxnHashHex || submitResult?.txnHashHex;
  if (!txnHashHex) throw new Error("Identity did not return a transaction hash");

  return { TxnHashHex: txnHashHex };
}
