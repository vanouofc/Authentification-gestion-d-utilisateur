# PharmOnline — API Authentification

API d'authentification de la plateforme PharmOnline, construite avec **Node.js**, **Express**, **Better Auth** et **MongoDB**.

---

## Stack technique

- **Runtime** : Node.js
- **Framework** : Express 5
- **Auth** : Better Auth
- **Base de données** : MongoDB (driver natif + Mongoose)
- **Emails** : Resend
- **Documentation** : Swagger UI (`/api-docs`)

---

## Installation

```bash
git clone https://github.com/ton-repo/pharmonline-api.git
cd pharmonline-api
npm install
```

### Variables d'environnement

Crée un fichier `.env` à la racine :

```env
DB_URL=mongodb://...
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=une_chaine_aleatoire_longue
FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

RESEND_API=re_...
```

### Lancer le serveur

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`.
La documentation Swagger est disponible sur `http://localhost:3000/api-docs`.

---

## Authentification

L'API utilise deux mécanismes d'authentification :

**Cookie de session** — défini automatiquement après connexion :
```
Cookie: better-auth.session_token=...
```

**Bearer Token** — token court retourné dans le body après connexion :
```
Authorization: Bearer <token>
```

> Le header `Origin` est obligatoire sur les routes POST protégées.

---

## Modèle Utilisateur

| Champ | Type | Description |
|---|---|---|
| `id` | string | Identifiant unique |
| `nom` | string | Nom complet |
| `email` | string | Adresse email (unique) |
| `role` | string | `Client` / `Pharmacien` / `Admin` |
| `phone` | string | Numéro de téléphone |
| `photo` | string | URL de la photo de profil |
| `emailVerified` | boolean | Email vérifié ou non |
| `isActive` | boolean | Compte actif ou supprimé |
| `deletedAt` | date | Date de suppression (soft delete) |
| `restoredAt` | date | Date de restauration |
| `createdAt` | date | Date de création |
| `updatedAt` | date | Date de dernière modification |

---

## Middlewares

| Middleware | Rôle |
|---|---|
| `requireSession` | Vérifie que l'utilisateur est connecté |
| `verifiedEmail` | Vérifie que l'email est confirmé |
| `requireRole('Admin')` | Vérifie le rôle de l'utilisateur |

---

## Endpoints

### 🔐 Inscription & Connexion

#### `POST /api/auth/sign-up/email`
Crée un nouveau compte. Un email de vérification est envoyé automatiquement.

**Body :**
```json
{
  "email": "jean.dupont@example.com",
  "password": "motdepasse123",
  "name": "Jean Dupont",
  "phone": "699000000"
}
```

| Code | Description |
|---|---|
| `200` | Compte créé. Email de vérification envoyé. |
| `422` | Données invalides (email déjà utilisé, mot de passe trop court...) |

---

#### `POST /api/auth/sign-in/email`
Connecte un utilisateur. Retourne un cookie de session et un token court.

**Body :**
```json
{
  "email": "jean.dupont@example.com",
  "password": "motdepasse123"
}
```

| Code | Description |
|---|---|
| `200` | Connexion réussie. Cookie de session défini. |
| `401` | Email ou mot de passe incorrect. |
| `403` | Email non vérifié. |

---

### 🔁 Session

#### `GET /api/auth/get-session`
Retourne la session et l'utilisateur connecté. Retourne `null` si aucune session active.

**Headers requis :** `Authorization: Bearer <token>` ou cookie de session.

| Code | Description |
|---|---|
| `200` | Session active ou `null`. |

---

#### `POST /api/auth/sign-out`
Déconnecte l'utilisateur et révoque la session.

**Headers requis :** `Authorization`, `Origin`.

| Code | Description |
|---|---|
| `200` | Déconnexion réussie. |
| `401` | Non authentifié. |

---

#### `GET /api/auth/ok`
Route de santé de Better Auth.

```json
{ "ok": true }
```

---

### ✉️ Vérification Email

#### `POST /api/auth/send-verification-email`
Renvoie un email de vérification. Utile si le lien précédent a expiré (valide **1 heure**).

**Body :**
```json
{
  "email": "jean.dupont@example.com",
  "callbackURL": "http://localhost:3000/dashboard"
}
```

| Code | Description |
|---|---|
| `200` | Email envoyé. |
| `400` | Email introuvable ou déjà vérifié. |

---

#### `GET /api/auth/verify-email?token=XXXXX`
Appelée automatiquement quand l'utilisateur clique sur le lien reçu par email.

| Paramètre | Requis | Description |
|---|---|---|
| `token` | ✅ | Token de vérification |
| `callbackURL` | ❌ | URL de redirection après vérification |

| Code | Description |
|---|---|
| `200` | Email vérifié. Utilisateur connecté automatiquement. |
| `400` | Token invalide ou expiré. |

---

### 🔢 OTP

#### `POST /api/auth/email-otp/send-verification-otp`
Envoie un code OTP à 6 chiffres par email. Valable **10 minutes**.

**Body :**
```json
{
  "email": "jean.dupont@example.com",
  "type": "sign-in"
}
```

| Type | Usage |
|---|---|
| `sign-in` | Connexion sans mot de passe |
| `email-verification` | Vérification du compte |
| `forget-password` | Réinitialisation du mot de passe |

| Code | Description |
|---|---|
| `200` | Code OTP envoyé. |
| `400` | Email introuvable. |

---

#### `POST /api/auth/email-otp/sign-in`
Connecte l'utilisateur avec un code OTP.

**Body :**
```json
{
  "email": "jean.dupont@example.com",
  "otp": "123456"
}
```

| Code | Description |
|---|---|
| `200` | Connexion réussie. |
| `400` | Code OTP invalide ou expiré. |

---

### 🔑 Mot de passe

#### `POST /api/auth/request-password-reset`
Envoie un lien de réinitialisation par email. Valable **10 minutes**.

**Body :**
```json
{
  "email": "jean.dupont@example.com",
  "redirectTo": "http://localhost:3000/reset-password"
}
```

| Code | Description |
|---|---|
| `200` | Email envoyé. |
| `400` | Email introuvable. |

---

#### `POST /api/auth/reset-password`
Réinitialise le mot de passe. Toutes les sessions actives sont révoquées.

**Body :**
```json
{
  "newPassword": "nouveaumotdepasse123",
  "token": "SbaWqXNB99kbFITCmNedMHr2"
}
```

> Le token se trouve dans le lien reçu par email : `.../reset-password?token=XXXXX`

| Code | Description |
|---|---|
| `200` | Mot de passe réinitialisé. Sessions révoquées. |
| `400` | Token invalide ou expiré. |

---

### 👤 Utilisateurs

#### `GET /api/user/:id`
Retourne les informations d'un utilisateur. Nécessite d'être connecté (email non vérifié accepté).

**Auth requise :** `requireSession`

| Code | Description |
|---|---|
| `200` | Utilisateur trouvé. |
| `401` | Non authentifié. |
| `404` | Utilisateur introuvable. |

---

#### `PATCH /api/user/update/:id`
Modifie le profil de l'utilisateur connecté. Un utilisateur ne peut modifier que son propre profil.

**Auth requise :** `requireSession`

**Body (tous les champs optionnels) :**
```json
{
  "nom": "Jean Dupont",
  "phone": "699000000",
  "photo": "https://example.com/photo.jpg"
}
```

| Code | Description |
|---|---|
| `200` | Profil mis à jour. |
| `400` | Aucun champ valide à mettre à jour. |
| `401` | Non authentifié. |
| `403` | Modification d'un autre profil interdite. |
| `404` | Utilisateur introuvable. |

---

### 🛡️ Admin

> Toutes les routes Admin nécessitent `verifiedEmail` + `requireRole('Admin')`.

#### `GET /api/user`
Liste tous les utilisateurs actifs (`isActive: true`).

| Code | Description |
|---|---|
| `200` | Liste des utilisateurs. |
| `401` | Non authentifié. |
| `403` | Accès refusé. Rôle requis : Admin. |

---

#### `DELETE /api/user/:id`
Soft delete — désactive le compte sans le supprimer (`isActive: false`, `deletedAt: now`).

| Code | Description |
|---|---|
| `200` | Utilisateur supprimé. |
| `400` | Utilisateur déjà supprimé. |
| `401` | Non authentifié. |
| `403` | Accès refusé. Rôle requis : Admin. |
| `404` | Utilisateur introuvable. |

---

#### `POST /api/user/restore/:id`
Restaure un compte désactivé (`isActive: true`, `deletedAt: null`, `restoredAt: now`).

| Code | Description |
|---|---|
| `200` | Utilisateur restauré. |
| `400` | Utilisateur déjà actif. |
| `401` | Non authentifié. |
| `403` | Accès refusé. Rôle requis : Admin. |
| `404` | Utilisateur introuvable. |

---

#### `PATCH /api/user/role/:id`
Modifie le rôle d'un utilisateur.

**Body :**
```json
{
  "role": "Pharmacien"
}
```

Valeurs acceptées : `Client`, `Pharmacien`, `Admin`.

| Code | Description |
|---|---|
| `200` | Rôle mis à jour. |
| `400` | Rôle invalide. |
| `401` | Non authentifié. |
| `403` | Accès refusé. Rôle requis : Admin. |
| `404` | Utilisateur introuvable. |

> **Note :** Le premier Admin doit être défini directement en base de données via MongoDB Compass ou mongosh :
> ```js
> db.utilisateurs.updateOne({ email: "admin@pharmonline.com" }, { $set: { role: "Admin" } })
> ```

---

## Structure du projet

```
├── auth.js                          # Config Better Auth
├── app.js                           # Serveur Express
├── swagger.json                     # Documentation OpenAPI
├── config/
│   └── mongodb.js                   # Connexion MongoDB
├── controllers/
│   ├── user.controller.js           # Logique utilisateurs
│   └── mail.controller.js           # Envoi d'emails (Resend)
├── middlewares/
│   ├── requireSession.middleware.js # Vérifie la session
│   ├── verifiedEmail.middleware.js  # Vérifie l'email
│   └── requireRole.middleware.js    # Vérifie le rôle
├── models/
│   └── utilisateur.model.js         # Schéma Mongoose
└── routes/
    └── utilisateur.routes.js        # Routes utilisateurs
```

---

## Licence

TINGUEU NGUIFO Shivano
