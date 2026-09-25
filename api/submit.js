const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const data = req.body;

    if (!data || !data.aliado || !data.correo || !Array.isArray(data.canales) || data.canales.length === 0) {
      res.status(400).json({ error: 'Datos incompletos' });
      return;
    }

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const sheetId = process.env.SHEET_ID;

    if (!clientEmail || !privateKey || !sheetId) {
      console.error('Faltan variables de entorno GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY / SHEET_ID');
      res.status(500).json({ error: 'El formulario no está configurado correctamente. Contacta al equipo de Addi.' });
      return;
    }

    const auth = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    const direcciones = (data.direccionesPOP || [])
      .map((a) => `${a.ciudad} - ${a.direccion} - Recibe: ${a.recibe} (${a.identificacion}) - Cel: ${a.celular}`)
      .join(' | ');

    const tiendaFisica = data.tiendaFisica || {};
    const ecommerce = data.ecommerce || {};

    const row = [
      new Date().toISOString(),
      data.aliado || '',
      data.solicitante || '',
      data.correo || '',
      (data.canales || []).join(' + '),
      data.multimarca || '',
      data.tiendasTotales || '',
      direcciones,
      tiendaFisica.habladoresSolicitados || '',
      tiendaFisica.compromisoInstalacionPOP ? 'Si' : (data.canales.includes('Tienda física') ? 'No' : ''),
      tiendaFisica.compromisoCapacitacion ? 'Si' : (data.canales.includes('Tienda física') ? 'No' : ''),
      tiendaFisica.compromisoCRM ? 'Si' : '',
      (ecommerce.formatosVisibilidad || []).join(', '),
      ecommerce.cadenciaMensualDias || '',
      ecommerce.compromisoCheckout ? 'Si' : (data.canales.includes('E-commerce') ? 'No' : ''),
      ecommerce.compromisoCRM ? 'Si' : ''
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Respuestas!A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error guardando en Sheets:', err);
    res.status(500).json({ error: 'No se pudo guardar la respuesta. Intenta de nuevo.' });
  }
};
