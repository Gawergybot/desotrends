import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

globalThis.React = React;

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));
