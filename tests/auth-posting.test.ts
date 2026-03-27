import { beforeEach, expect, test, vi } from "vitest";

const configureMock = vi.fn();
const loginMock = vi.fn();
const signTxMock = vi.fn();
const submitTxMock = vi.fn();

vi.mock("deso-protocol", () => ({
  configure: configureMock,
  identity: {
    login: loginMock,
    signTx: signTxMock,
    submitTx: submitTxMock,
  },
}));

beforeEach(() => {
  configureMock.mockReset();
  loginMock.mockReset();
  signTxMock.mockReset();
  submitTxMock.mockReset();
  vi.resetModules();
});

test("launchLogin resolves public key from identity login", async () => {
  loginMock.mockResolvedValue({ publicKey: "BC1YLtestPublicKey" });

  const { launchLogin } = await import("@/lib/identity");
  const key = await launchLogin();

  expect(configureMock).toHaveBeenCalledTimes(1);
  expect(loginMock).toHaveBeenCalledTimes(1);
  expect(key).toBe("BC1YLtestPublicKey");
});

test("submitPost constructs, signs, then submits through identity submit", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ TransactionHex: "unsigned-hex" }),
  });

  vi.stubGlobal("fetch", fetchMock);

  signTxMock.mockResolvedValue("signed-hex");
  submitTxMock.mockResolvedValue("txn-hash");

  const { signTransaction, submitSignedTransaction } = await import("@/lib/identity");
  const { submitPost } = await import("@/lib/deso");

  const result = await submitPost("BC1YLposter", "hello world", signTransaction, submitSignedTransaction);

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(signTxMock).toHaveBeenCalledWith("unsigned-hex");
  expect(submitTxMock).toHaveBeenCalledWith("signed-hex");
  expect(result).toEqual({ TxnHashHex: "txn-hash" });

  vi.unstubAllGlobals();
});

test("signTransaction surfaces identity signing failure", async () => {
  signTxMock.mockRejectedValue(new Error("user cancelled"));

  const { signTransaction } = await import("@/lib/identity");

  await expect(signTransaction("unsigned-hex")).rejects.toThrow("user cancelled");
});
