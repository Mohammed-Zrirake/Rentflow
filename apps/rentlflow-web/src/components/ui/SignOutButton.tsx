// file: apps/rentflow-web/src/components/SignOutButton.tsx
"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{ marginTop: "20px" }}
    >
      Sign Out
    </button>
  );
}
