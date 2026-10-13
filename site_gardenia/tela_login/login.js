require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Consulta de CPF
app.get('/api/consultar-cpf/:cpf', async (req, res) => {
  const cpf = String(req.params.cpf).replace(/\D/g, '');

  // Validação básica antes de gastar cota da API
  if (!/^\d{11}$/.test(cpf)) {
    return res.status(400).json({ success: false, message: 'CPF inválido.' });
  }

  if (!process.env.API_CPF_KEY) {
    return res.status(500).json({ success: false, message: 'API de CPF não configurada no servidor.' });
  }

  try {
    const url = `https://apiconsulta.com.br/painel?cpf=${cpf}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-API-KEY': process.env.API_CPF_KEY }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || `A API retornou HTTP ${response.status}.`
      });
    }

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Erro ao consultar CPF:', err);
    return res.status(502).json({
      success: false,
      message: 'Não foi possível consultar o CPF. Tente novamente.'
    });
  }
});

// Validação De E-mail
app.get('/api/validar-email/:email', async (req, res) => {
  const email = String(req.params.email).trim();

  // Validação de sintaxe antes de gastar cota
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Formato de e-mail inválido.' });
  }

  if (!process.env.API_EMAIL_KEY) {
    // Fallback: se não tiver chave configurada, responde apenas com validação de sintaxe
    return res.json({
      success: true,
      data: {
        is_valid_format: true,
        is_disposable: false,
        deliverability: 'UNKNOWN',
        is_free_email: false
      }
    });
  }

  try {
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.API_EMAIL_KEY}&email=${encodeURIComponent(email)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Erro ao validar e-mail:', err);
    return res.status(502).json({
      success: false,
      message: 'Não foi possível validar o e-mail. Verifique sua conexão.'
    });
  }
});

// Verificação do reCAPTCHA
async function verificarRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) throw new Error('RECAPTCHA_SECRET_KEY não configurada');

  const params = new URLSearchParams({ secret: secretKey, response: token });
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.error('Erro ao verificar reCAPTCHA:', err);
    return false;
  }
}

// Rate limiter UNIFICADO
const tentativasPorIP = new Map();
/* Descomente quando for fazer testes para evitar bloqueio
const MAX_TENTATIVAS = 99999999999; */
const MAX_TENTATIVAS = 16;
const TEMPO_BLOQUEIO_MS = 64 * 60 * 1000;

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const agora = Date.now();
  let registro = tentativasPorIP.get(ip) || { count: 0, blockedUntil: 0 };

  if (registro.blockedUntil > agora) {
    const min = Math.ceil((registro.blockedUntil - agora) / 60000);
    return res.status(429).json({
      success: false,
      message: `Muitas tentativas. Tente novamente em ${min} minutos.`
    });
  }

  if (registro.blockedUntil > 0 && registro.blockedUntil <= agora) {
    registro.count = 0;
    registro.blockedUntil = 0;
  }

  req.rateLimitRegistro = registro;
  req.rateLimitIP = ip;
  next();
}

// Helper para registrar falha (chamado DENTRO da rota, só em caso de erro)
function registrarFalha(ip, registro) {
  registro.count++;
  if (registro.count >= MAX_TENTATIVAS) {
    registro.blockedUntil = Date.now() + TEMPO_BLOQUEIO_MS;
  }
  tentativasPorIP.set(ip, registro);
  return registro.count >= MAX_TENTATIVAS;
}

// Rota (registrada UMA vez só, com middleware)
app.post('/api/validar-cadastro', rateLimiter, async (req, res) => {
  const { nome, email, recaptchaToken } = req.body;
  const registro = req.rateLimitRegistro;
  const ip = req.rateLimitIP;

  if (!nome || !email || !recaptchaToken) {
    return res.status(400).json({ success: false, message: 'Dados incompletos.' });
  }

  const captchaValido = await verificarRecaptcha(recaptchaToken);

  if (!captchaValido) {
    const bloqueado = registrarFalha(ip, registro);
    return res.status(bloqueado ? 429 : 400).json({
      success: false,
      message: bloqueado
        ? 'Limite de tentativas excedido. IP bloqueado por 64 minutos.'
        : 'Falha na verificação do reCAPTCHA. Tente novamente.'
    });
  }

  // Sucesso — reseta contador
  registro.count = 0;
  registro.blockedUntil = 0;
  tentativasPorIP.set(ip, registro);

  res.json({ success: true, message: 'CAPTCHA validado.' });
});

// 5. Listen
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));