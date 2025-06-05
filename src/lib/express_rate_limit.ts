
import { rateLimit } from 'express-rate-limit';

// implementa la limitación de velocidad de la API. restringe cuántas solicitudes 
// puede hacer un cliente (identificado por su dirección IP) a tu servidor en un período de tiempo determinado. 
const limiter = rateLimit({ 
  windowMs: 60000,                        // 1 minuto
  limit: 60,                              // 60 solicitudes por minuto
  standardHeaders: 'draft-8',             // Cabeceras de la solicitud standard http
  legacyHeaders: false,                   // Cabeceras de la solicitud legacy http antiguas deshabilitadas
  message: { 
    error: 'Too many requests',
  }
})

export default limiter;
