# Guide d'installation - SGEE Frontend

## Prérequis

- Node.js 18+ et npm
- Backend Laravel en cours d'exécution sur http://localhost:8000

## Installation

### 1. Cloner le projet

```bash
git clone <votre-repo-url>
cd sgee-frontend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Copier le fichier `.env.example` vers `.env` :

```bash
copy .env.example .env
```

Le fichier `.env` contient déjà la configuration par défaut :
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=SGEE
```

### 4. Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Structure des dossiers

```
sgee-frontend/
├── public/              # Fichiers statiques
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── contexts/        # Contextes React
│   │   └── AuthContext.jsx
│   ├── pages/          # Pages de l'application
│   │   ├── auth/       # Authentification
│   │   ├── admin/      # Pages admin
│   │   ├── LandingPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EcolesList.jsx
│   │   ├── EnrollmentForm.jsx
│   │   └── MyEnrollments.jsx
│   ├── services/       # Services API
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── ecoleService.js
│   │   ├── enrollmentService.js
│   │   └── regionService.js
│   ├── App.jsx         # Composant principal
│   ├── main.jsx        # Point d'entrée
│   └── index.css       # Styles globaux
├── .env                # Variables d'environnement
├── package.json        # Dépendances
├── tailwind.config.js  # Configuration Tailwind
└── vite.config.js      # Configuration Vite
```

## Fonctionnalités implémentées

### Authentification
- ✅ Inscription avec validation email
- ✅ Connexion
- ✅ Vérification email avec code
- ✅ Protection des routes

### Candidats
- ✅ Page d'accueil (Landing page)
- ✅ Tableau de bord
- ✅ Liste des écoles disponibles
- ✅ Formulaire d'inscription aux concours
- ✅ Suivi des inscriptions
- ✅ Sélection région/département du Cameroun

### Administrateurs
- ✅ Dashboard admin
- ✅ Gestion des écoles
- ✅ Gestion des concours (à compléter)
- ✅ Validation des inscriptions (à compléter)

## Prochaines étapes

1. **OCR pour justificatifs** - Intégrer Tesseract.js pour extraire les données des reçus bancaires
2. **Géolocalisation** - Ajouter les cartes Leaflet pour les centres d'examen
3. **Génération PDF** - Créer les reçus d'inscription avec QR code
4. **Upload calendrier** - Permettre à l'admin d'uploader le PDF des concours
5. **Validation paiements** - Interface admin pour valider/rejeter les inscriptions

## Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview

# Lint
npm run lint
```

## Dépannage

### Port déjà utilisé
Si le port 3000 est déjà utilisé, modifiez `vite.config.js` :
```js
server: {
  port: 3001, // Changez le port
}
```

### Erreur CORS
Assurez-vous que le backend Laravel autorise les requêtes depuis http://localhost:3000

### API non accessible
Vérifiez que le backend est bien démarré sur http://localhost:8000
