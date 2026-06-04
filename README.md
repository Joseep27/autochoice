# AutoChoice 🚗

Analizador de coches de segunda mano con IA. Pega la URL de cualquier anuncio y recibe un análisis completo: precio vs mercado, puntuación por criterios, señales de alerta y veredicto.

## Plataformas compatibles
- coches.net
- autoscout24.es
- flexicar.es
- wallapop.com
- milanuncios.com

---

## Cómo desplegarlo en Railway (gratis)

### 1. Sube este código a GitHub
- Crea un repositorio nuevo en github.com (público o privado)
- Sube los tres archivos: `server.js`, `package.json`, y la carpeta `public/`

### 2. Despliega en Railway
1. Ve a [railway.app](https://railway.app) y crea una cuenta gratis
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Elige tu repositorio de AutoChoice
5. Railway detecta automáticamente que es Node.js y lo despliega
6. En **Settings → Networking**, genera un dominio público

### 3. Usa la app
- Abre la URL que te da Railway
- Introduce tu API Key de Anthropic (se obtiene gratis en console.anthropic.com)
- Pega cualquier URL de anuncio y pulsa Analizar

---

## Estructura del proyecto

```
autochoice/
├── server.js          # Backend: visita la URL y llama a la IA
├── package.json       # Dependencias de Node.js
└── public/
    └── index.html     # Frontend completo
```

## Variables de entorno (opcionales)
No son necesarias. La API Key la introduce el usuario en la interfaz.

---

## Desarrollo local

```bash
npm install
node server.js
# Abre http://localhost:3000
```
