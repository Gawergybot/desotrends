import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

const launchLoginMock = vi.fn();
const resolveAuthUserMock = vi.fn();

vi.mock("@/lib/identity", () => ({
  getCurrentIdentityPublicKey: vi.fn().mockResolvedValue(null),
  launchLogin: launchLoginMock,
  logoutIdentity: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/deso", () => ({
  profilePicUrl: (publicKey: string) => `https://node.deso.org/api/v0/get-single-profile-picture/${publicKey}`,
  resolveAuthUser: resolveAuthUserMock,
}));

import { AuthProvider, useAuth } from "@/hooks/useAuth";

function Harness() {
  const { signIn, user, authError } = useAuth();

  return (
    <div>
      <button onClick={() => void signIn()}>Sign in</button>
      <span data-testid="user-key">{user?.publicKey ?? "none"}</span>
      <span data-testid="auth-error">{authError ?? "none"}</span>
    </div>
  );
}

beforeEach(() => {
  launchLoginMock.mockReset();
  resolveAuthUserMock.mockReset();
  window.localStorage.clear();
});

test("signIn keeps fallback signed-in state when hydration fails", async () => {
  launchLoginMock.mockResolvedValue("BC1YLsignInKey");
  resolveAuthUserMock.mockRejectedValue(new Error("enrichment failed"));

  render(
    <AuthProvider>
      <Harness />
    </AuthProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

  await waitFor(() => {
    expect(screen.getByTestId("user-key").textContent).toBe("BC1YLsignInKey");
  });

  expect(screen.getByTestId("auth-error").textContent).toBe("none");
});
