"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Spin } from "antd"; // Pour un bel indicateur de chargement

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // On attend que la session soit chargée (status n'est plus 'loading')
    if (status === "loading") {
      return; // On ne fait rien tant que la vérification est en cours
    }

    // Si la session n'est pas chargée (elle est `null` ou `undefined`),
    // et que le statut n'est plus en cours de chargement, alors l'utilisateur n'est pas authentifié.
    if (!session) {
      router.push("/login"); // On redirige vers la page de connexion
    }
  }, [session, status, router]);

  // Pendant que la session est en cours de vérification, on affiche un spinner
  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Si la session est chargée et que l'utilisateur est authentifié, on affiche le contenu de la page
  if (session) {
    return <>{children}</>;
  }

  // Par défaut (au cas où la redirection prendrait du temps), on n'affiche rien pour éviter le flash
  return null;
}
