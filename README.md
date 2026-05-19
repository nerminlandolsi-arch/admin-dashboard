# 🖥️ Dashboard Web Admin — DeliveryApp

Interface d'administration React.js pour la gestion des livraisons.

## 🚀 Démarrage rapide

```bash
npm install
npm start
```
Ouvre sur **http://localhost:3000**

Le backend doit tourner sur **http://localhost:8080**

## 📄 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Connexion | Auth JWT |
| `/dashboard` | Tableau de bord | KPIs, graphiques, top livreurs |
| `/colis` | Gestion colis | CRUD complet, filtres, assignation |
| `/livreurs` | Gestion livreurs | Liste, activer/désactiver, stats |
| `/carte` | Carte GPS | Positions temps réel (auto-refresh 15s) |

## 🔑 Compte démo

- Email : `admin@delivery.com`
- Mot de passe : `Admin@1234`

## ⚙️ Variables d'environnement

Créez `.env` à la racine :
```
REACT_APP_API_URL=http://localhost:8080/api
```

## 🛠️ Stack

- **React 18** + React Router v6
- **Recharts** — graphiques
- **React Leaflet** — carte OpenStreetMap
- **Lucide React** — icônes
- **React Hot Toast** — notifications
- **Axios** — appels API avec intercepteur JWT
