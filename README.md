# SGEE Frontend - Système de Gestion des Examens et Enrôlements

Application React pour la gestion des inscriptions aux concours nationaux des grandes écoles du Cameroun.

## 🚀 Technologies

- **React 18** - Framework UI
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Gestion des formulaires
- **React Toastify** - Notifications
- **Leaflet** - Cartes interactives
- **Tesseract.js** - OCR pour justificatifs
- **Lucide React** - Icônes

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
copy .env.example .env

# Configurer l'URL de l'API dans .env
VITE_API_URL=http://localhost:8000/api
```

## 🏃 Démarrage

```bash
# Mode développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

## 📁 Structure du projet

```
src/
├── components/        # Composants réutilisables
├── contexts/         # Contextes React (Auth, etc.)
├── pages/           # Pages de l'application
│   ├── auth/        # Pages d'authentification
│   └── admin/       # Pages admin
├── services/        # Services API
├── App.jsx          # Composant principal
└── main.jsx         # Point d'entrée
```

## 🎨 Fonctionnalités

### Pour les candidats
- ✅ Inscription et authentification
- ✅ Vérification email
- ✅ Consultation des écoles disponibles
- ✅ Inscription aux concours
- ✅ Upload de justificatif de paiement
- ✅ Suivi des inscriptions
- ✅ Téléchargement du reçu avec QR code

### Pour les administrateurs
- ✅ Gestion des écoles
- ✅ Gestion des concours
- ✅ Validation des inscriptions
- ✅ Gestion des centres d'examen
- ✅ Upload de calendrier PDF

## 🎨 Design

L'interface utilise des couleurs douces et professionnelles reflétant le cadre scolaire :
- Bleu primaire (#0ea5e9) - Confiance et professionnalisme
- Violet secondaire (#d946ef) - Créativité et innovation
- Vert académique (#059669) - Succès et validation
- Orange académique (#ea580c) - Attention et action

## 📱 Responsive

L'application est entièrement responsive et optimisée pour :
- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)

## 🔐 Authentification

L'application utilise Laravel Sanctum pour l'authentification :
- Token stocké dans localStorage
- Intercepteur Axios pour ajouter le token
- Redirection automatique si non authentifié

## 🌍 Régions du Cameroun

Les 10 régions et 58 départements du Cameroun sont disponibles via un fichier JSON statique pour les formulaires d'inscription.

## 📄 License

MIT
