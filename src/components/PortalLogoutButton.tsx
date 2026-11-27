"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PortalLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/portal");
      router.refresh();
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={onClick}
      disabled={pending}
    >
      {pending ? "Saindo…" : "Sair"}
    </button>
  );
}
