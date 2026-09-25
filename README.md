# Registro 3x0 KA — Vercel + Google Sheets

Formulario de registro del beneficio 3x0 en primera compra para Key Accounts. Cada envío se guarda como una fila nueva en un Google Sheet que tú controlas.

## Qué hay en esta carpeta

- `public/index.html` — el formulario (sin frameworks, HTML/CSS/JS plano).
- `api/submit.js` — función serverless de Vercel que recibe el formulario y escribe la fila en Google Sheets.
- `package.json` — declara la dependencia `googleapis`.
- `.env.example` — nombres de las variables de entorno que necesitas configurar en Vercel.

No necesitas Next.js ni build step: Vercel detecta `public/` como sitio estático y `api/` como funciones serverless automáticamente ("Other" framework preset).

## Paso 1 — Crear la hoja de Google

1. Crea un Google Sheet nuevo (o usa uno existente).
2. Renombra la primera pestaña a `Respuestas` (exactamente así, con mayúscula).
3. En la fila 1, pon estos encabezados (uno por columna, en este orden):

   `Fecha | Aliado | Solicitante | Correo | Canales | Multimarca | Tiendas totales | Direcciones POP | Habladores solicitados | Compromiso instalación POP | Compromiso capacitación | Compromiso CRM (tienda) | Formatos e-commerce | Cadencia mensual (días) | Compromiso checkout | Compromiso CRM (ecommerce)`

4. Copia el ID de la hoja: es la parte de la URL entre `/d/` y `/edit`.
   `https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit`

## Paso 2 — Crear la cuenta de servicio de Google (una sola vez)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) y crea un proyecto nuevo (o usa uno existente).
2. En el buscador de la consola, busca **"Google Sheets API"** y haz clic en **Habilitar**.
3. Ve a **APIs y servicios > Credenciales > Crear credenciales > Cuenta de servicio**.
4. Dale un nombre (ej. `addi-forms-sheets`) y crea la cuenta. No necesitas asignarle roles de proyecto.
5. Entra a la cuenta de servicio creada, pestaña **Claves (Keys) > Agregar clave > Crear clave nueva > JSON**. Se descarga un archivo `.json`.
6. Abre ese archivo. Necesitas dos valores:
   - `client_email` → algo como `addi-forms-sheets@tu-proyecto.iam.gserviceaccount.com`
   - `private_key` → un bloque largo que empieza con `-----BEGIN PRIVATE KEY-----`
7. **Comparte tu Google Sheet con ese `client_email`** como Editor (botón "Compartir" en la hoja, igual que compartirla con una persona). Sin este paso, la API no podrá escribir.

## Paso 3 — Subir el proyecto a GitHub

Necesitas GitHub porque Vercel despliega desde un repositorio.

```bash
cd registro-3x0-ka
git init
git add .
git commit -m "Formulario 3x0 KA"
```

Crea un repositorio vacío en GitHub y sigue las instrucciones para conectarlo (`git remote add origin ...`, `git push -u origin main`).

## Paso 4 — Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta (o créala con tu correo de Addi).
2. **Add New > Project**, elige el repositorio que acabas de subir.
3. En **Environment Variables**, agrega estas tres (los nombres deben ser exactos):

   | Nombre | Valor |
   |---|---|
   | `GOOGLE_CLIENT_EMAIL` | el `client_email` del paso 2 |
   | `GOOGLE_PRIVATE_KEY` | el `private_key` completo del paso 2, **entre comillas dobles**, tal cual viene en el JSON (con los `\n` incluidos) |
   | `SHEET_ID` | el ID de tu hoja del paso 1 |

4. Haz clic en **Deploy**. En 1–2 minutos tendrás una URL tipo `https://registro-3x0-ka.vercel.app`.
5. Abre esa URL, llena el formulario de prueba y confirma que la fila aparece en tu Google Sheet.

## Actualizar el formulario más adelante

Cualquier cambio de texto o de campos se hace editando `public/index.html`, luego:

```bash
git add .
git commit -m "Ajuste al formulario"
git push
```

Vercel vuelve a desplegar automáticamente en cada push.

## Dominio propio (opcional)

En Vercel, **Project Settings > Domains**, puedes conectar un subdominio propio, por ejemplo `3x0.addi.com`, si el equipo de infraestructura te da acceso al DNS.

## Nota sobre el formulario de Evidencias mensuales

Esta carpeta solo cubre el formulario de **Registro**. El de **Evidencias** (que pide fotos y capturas) necesita además un lugar donde guardar los archivos adjuntos — normalmente Google Drive vía la misma cuenta de servicio. Dime si quieres que arme esa segunda parte y la agrego con el mismo enfoque (Sheets para los datos + Drive para los archivos, con el link del archivo guardado en la fila correspondiente).
