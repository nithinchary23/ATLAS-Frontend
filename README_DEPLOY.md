# ATLAS Frontend Deployment

## Setup

```powershell
npm install
```

## Local Run

Create a `.env` file from `.env.example` and set:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:5000/api
```

Then run:

```powershell
npm start
```

## Tests

```powershell
npm test -- --watchAll=false
```

## Production Build

```powershell
npm run build
```

Set `REACT_APP_API_BASE_URL` to your deployed backend API URL before building.
