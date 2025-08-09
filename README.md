RentFlow - Application de Gestion de Location de Véhicules
RentFlow est une solution complète conçue pour simplifier et automatiser la gestion d'une agence de location de véhicules. Développée avec une stack technologique moderne, elle offre une interface d'administration riche pour gérer la flotte, les clients, les réservations, les contrats et la facturation.
<!-- Remplacez par une capture d'écran de votre tableau de bord -->
![alt text](https://example.com/screenshot.png)
Table des Matières
Fonctionnalités Clés
Stack Technologique
Structure du Projet (Monorepo)
Prérequis
Installation et Lancement
Logique Métier et Flux de Travail
Variables d'Environnement
Prochaines Étapes
Fonctionnalités Clés
Gestion de la Flotte : Ajout, modification et suivi des véhicules. Gestion du statut (Disponible, Loué, Réservé, En Maintenance) basé sur un calendrier d'engagements.
Gestion des Clients : Fichier client complet avec gestion des documents d'identité (CIN, permis, passeport).
Système de Réservation Intelligent :
Calendrier de disponibilité des véhicules en temps réel.
Gestion des réservations en chaîne (réservations futures pour des véhicules déjà engagés).
Logique de confirmation de réservation avec gestion d'acomptes.
Gestion des Contrats :
Création de contrats directs ou à partir d'une réservation confirmée.
Gestion des conducteurs principaux et secondaires.
Suivi de l'état du véhicule (kilométrage, carburant) au départ et au retour.
Facturation et Paiements :
Génération automatique de factures pour chaque réservation et contrat.
Suivi des statuts de paiement (En attente, Partiellement payé, Payé).
Enregistrement de multiples paiements par facture.
Gestion d'Équipe et Rôles :
Système de rôles (Admin, User).
Permissions différenciées pour l'accès aux sections sensibles (Paramètres, Gestion d'équipe).
Alertes Automatisées : Création d'alertes en cas de conflits (ex: un véhicule mis en maintenance avec des réservations futures).
Stack Technologique
Framework Frontend : Next.js (App Router)
Framework Backend : NestJS
Langage : TypeScript
Base de Données : MySQL
ORM : Prisma
UI : Ant Design
Authentification : NextAuth.js
Gestionnaire de Paquets : PNPM (avec Workspaces)
Validation : Zod (côté client) et class-validator (côté serveur)
Structure du Projet (Monorepo)
Ce projet est structuré en monorepo pnpm pour une meilleure organisation et un partage de code efficace.
code
Text
/
├── apps/
│   ├── rentflow-api/       # Application Backend (NestJS)
│   └── rentflow-web/       # Application Frontend (Next.js)
├── packages/
│   ├── database/           # Schéma Prisma et client généré
│   ├── schemas/            # Schémas de validation Zod partagés
│   └── eslint-config-custom/ # Configuration ESLint partagée
└── package.json            # Dépendances et scripts du workspace
Prérequis
Node.js (v18 ou supérieur)
PNPM (v8 ou supérieur)
Un serveur de base de données MySQL
Docker (recommandé pour la base de données)
Installation et Lancement
Cloner le dépôt :
code
Bash
git clone [URL_DE_VOTRE_REPO]
cd [NOM_DU_DOSSIER]
Installer les dépendances :
À la racine du projet, exécutez :
code
Bash
pnpm install
Configurer les Variables d'Environnement :
Créez un fichier .env à la racine du projet et remplissez les variables nécessaires (voir la section Variables d'Environnement).
Appliquer les Migrations de la Base de Données :
Cette commande va créer les tables dans votre base de données en se basant sur le schéma Prisma.
code
Bash
pnpm prisma migrate dev
Lancer les applications en mode développement :
Cette commande lancera simultanément le backend NestJS et le frontend Next.js.
code
Bash
pnpm dev
Le frontend sera accessible sur http://localhost:3000.
Le backend sera accessible sur http://localhost:3001.
Logique Métier et Flux de Travail
Le cœur de l'application repose sur le cycle de vie d'un engagement, de la réservation à la facturation finale.
Réservation (PENDING) : Un véhicule est bloqué pour une période.
Confirmation (CONFIRMED) : Un acompte est versé, la réservation est validée.
Création de Contrat (ACTIVE) : La réservation est transformée en contrat actif. Le statut du véhicule passe à RENTED.
Terminaison de Contrat (COMPLETED) : Le client rend le véhicule. Le coût est recalculé, le paiement final est enregistré, la facture est mise à jour, et le statut du véhicule est recalculé (AVAILABLE ou MAINTENANCE).
Annulation (CANCELLED/VOID) : Une réservation ou un contrat est annulé. La facture associée est annulée (VOID), et le statut du véhicule est recalculé.
Le statut d'un véhicule est géré par une fonction centralisée qui analyse son calendrier d'engagements pour garantir une disponibilité toujours à jour.
Variables d'Environnement
Créez un fichier .env à la racine et ajoutez les variables suivantes :
code
Env
# Base de données
DATABASE_URL="mysql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]"

# Authentification
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[GÉNÉREZ_UNE_CLÉ_SECRÈTE_FORTE]
JWT_SECRET=[LA_MÊME_CLÉ_SECRÈTE_FORTE]

# Google Provider (Optionnel)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
Prochaines Étapes
Implémenter la génération de PDF pour les contrats et les factures.
Compléter la page d'alertes pour afficher les conflits et les rappels.
Développer le système de gestion d'équipe (ajout/modification/blocage des utilisateurs).
Mettre en place un système de rôles plus granulaire.
Déployer l'application sur une plateforme comme Vercel (pour le frontend) et un service d'hébergement de serveurs (pour le backend).
