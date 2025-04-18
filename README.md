# Bike Shop & Rental Platform

Acest proiect reprezintă o platformă web pentru vânzarea și închirierea de biciclete.

## Cerințe preliminare

Pentru a rula acest proiect, trebuie să ai instalate următoarele:

- [Node.js](https://nodejs.org/) (versiunea 16.x sau mai recentă)
- [npm](https://www.npmjs.com/) (vine împreună cu Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (versiunea 4.x sau mai recentă)

## Structura proiectului

Proiectul este împărțit în două părți principale:
- **Frontend**: Aplicație React
- **Backend**: Server Node.js cu Express și MongoDB

## Pași pentru instalare și rulare

### 1. Clonează repository-ul

```bash
git clone https://github.com/David2453/my-web-project
cd my-web-project
```

### 2. Configurează baza de date MongoDB

- Asigură-te că ai MongoDB instalat și rulând pe calculatorul tău
- Serverul MongoDB ar trebui să ruleze pe portul 27017 (portul implicit)

### 3. Instalează dependențele din directorul rădăcină

```bash
# Instalează dependențele din directorul rădăcină
npm install

# Sau pentru o instalare mai consistentă (dacă există package-lock.json)
npm ci

# Verifică vulnerabilitățile de securitate
npm audit

# Rezolvă vulnerabilitățile de securitate (dacă există)
npm audit fix
```

### 4. Configurează backend-ul

```bash
# Navighează în directorul backend
cd backend

# Instalează dependențele
npm install

# Sau folosește ci pentru o instalare exactă conform package-lock.json
npm ci

# Pentru probleme de compatibilitate între dependențe, poți încerca:
# npm install --legacy-peer-deps

# Verifică și rezolvă vulnerabilitățile de securitate
npm audit
npm audit fix

# Configurează variabilele de mediu
# Poți edita fișierul .env sau crea unul nou dacă nu există
```

Fișierul `.env` trebuie să conțină:
```
MONGO_URI=mongodb://localhost:27017/mywebproject
JWT_SECRET=your_jwt_secret_key
```
### 5. Sa creeaza o noua conexiune in MongoDBCompass cu connection string-ul:
```
mongodb://localhost:27017/
```

Poți modifica `JWT_SECRET` cu o valoare aleatoare pentru securitate sporită.

### 6. Populează baza de date

```bash
# În directorul backend
npm run seed
```

### 7. Configurează frontend-ul

```bash
# Navighează în directorul frontend
cd ../frontend

# Instalează dependențele
npm install

# Sau pentru o instalare mai precisă:
npm ci

# Pentru proiecte React cu dependențe complexe, uneori este necesar:
# npm install --legacy-peer-deps

# Verifică și rezolvă vulnerabilitățile
npm audit
npm audit fix
```

### 8. Rulează aplicația

#### Pornește backend-ul:

```bash
npm start
```

Serverul backend va rula pe `http://localhost:5000`.

#### Pornește frontend-ul:

```bash
# În directorul frontend
npm start
```

Aplicația frontend va rula pe `http://localhost:3000`.

## Funcționalități principale

- Vizualizare biciclete disponibile pentru vânzare și închiriere
- Filtrare biciclete după tip (Mountain Bike, Urban Bike, Road Bike)
- Sistem de rating pentru biciclete
- Posibilitatea de a cumpăra sau închiria biciclete
- Autentificare și înregistrare utilizatori
- Panou de administrare pentru gestionarea bicicletelor și comenzilor

## Note pentru dezvoltare

- Frontend-ul folosește React 19.0.0
- Backend-ul folosește Express 4.21.2
- Aplicația folosește MongoDB pentru stocarea datelor
- API-ul backend rulează pe portul 5000
- Frontend-ul are configurat un proxy către backend (în package.json)

## Tehnologii utilizate

### Frontend:
- React 19.0.0
- React DOM 19.0.0
- React Router DOM 7.3.0
- React Scripts 5.0.1
- Axios 1.8.3
- Material UI (@mui/material 6.4.8, @mui/icons-material 6.4.8)
- Bootstrap 5.3.3
- Chart.js 4.4.8
- React-ChartJS-2 5.3.0
- Leaflet 1.9.4
- React-Leaflet 5.0.0
- Web Vitals 2.1.4
- Biblioteci de testare:
  - @testing-library/dom 10.4.0
  - @testing-library/jest-dom 6.6.3
  - @testing-library/react 16.2.0
  - @testing-library/user-event 13.5.0

### Backend:
- Node.js
- Express 4.21.2
- MongoDB
- Mongoose 8.12.1
- CORS 2.8.5
- Dotenv 16.4.7
- JWT (jsonwebtoken 9.0.2) pentru autentificare
- bcrypt 5.1.1 pentru criptarea parolelor
- Multer 1.4.5-lts.2 pentru încărcarea fișierelor
