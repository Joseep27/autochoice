const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/fetch-listing', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();

    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000);

    res.json({ text, url });
  } catch (err) {
    res.status(500).json({ error: `No se pudo acceder al anuncio: ${err.message}` });
  }
});

app.post('/api/analyze', async (req, res) => {
  const { listingText, url } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!listingText) return res.status(400).json({ error: 'Faltan datos' });
  if (!apiKey) return res.status(500).json({ error: 'API Key no configurada en el servidor' });

  console.log('API Key found, length:', apiKey.length);
  console.log('API Key starts with:', apiKey.slice(0, 10));

  const prompt = `Eres un experto en coches de segunda mano en España con acceso a precios reales del mercado actual.

Analiza este anuncio de coche extraído de la web y genera un análisis completo.

URL del anuncio: ${url}

TEXTO DEL ANUNCIO:
${listingText}

Extrae toda la información relevante del texto (marca, modelo, año, km, precio, combustible, vendedor, ubicación, equipamiento, etc.) y genera un análisis de mercado realista.

Responde SOLO con JSON válido, sin texto extra ni backticks:

{
  "titulo": "Marca Modelo Año",
  "info": "Año · Km · Combustible · Cambio · Potencia CV · Ubicación",
  "precio_anuncio": 25900,
  "precio_mercado_min": 23000,
  "precio_mercado_max": 28000,
  "precio_mercado_medio": 25500,
  "puntuacion": 7.2,
  "veredicto": "Frase corta y directa sobre si comprar o no",
  "precio_maximo_pagar": 24000,
  "criterios": [
    {"nombre": "Precio vs mercado", "nota": 7},
    {"nombre": "Kilómetros", "nota": 8},
    {"nombre": "Antigüedad", "nota": 6},
    {"nombre": "Fiabilidad modelo", "nota": 9},
    {"nombre": "Vendedor", "nota": 7}
  ],
  "alertas": [
    {"tipo": "warn", "texto": "Descripción de la alerta"},
    {"tipo": "ok", "texto": "Punto positivo detectado"},
    {"tipo": "info", "texto": "Dato relevante a considerar"},
    {"tipo": "danger", "texto": "Señal de riesgo importante"}
  ],
  "resumen": "Párrafo de 4-5 frases con análisis detallado: contexto del anuncio, posición en el mercado, puntos fuertes y débiles, y recomendación concreta (comprar, negociar precio, o pasar)."
}

Tipos de alerta: warn=amarillo, ok=verde, info=azul, danger=rojo.
Genera entre 3 y 5 alertas relevantes basadas en los datos reales del anuncio.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    console.log('Anthropic status:', response.status);
    console.log('Anthropic response:', JSON.stringify(data).slice(0, 300));

    if (data.error) throw new Error(`Anthropic error: ${data.error.message}`);
    if (!data.content || !data.content[0]) throw new Error('Sin contenido en respuesta');

    let raw = data.content[0].text.trim().replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(raw);
    res.json(analysis);
  } catch (err) {
    console.error('Error completo:', err.message);
    res.status(500).json({ error: `Error al analizar: ${err.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AutoChoice corriendo en puerto ${PORT}`));
