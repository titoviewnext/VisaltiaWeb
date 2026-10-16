/**
 * ============================================================================
 * VISALTIA FISCAL — Script Principal (main.js)
 * Incluye:
 *  1. Animaciones suaves al hacer scroll (IntersectionObserver)
 *  2. Navegación pegajosa y menú móvil
 *  3. Conmutador de precios Mensual / Anual y preparación para Stripe/PayPal
 *  4. Sanitización contra XSS y validación estricta del formulario de contacto
 *  5. Envío POST simulado preparado para backend HTTPS
 * ============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initScreenshotTabs();
  initPaymentPlaceholders();
  initContactForm();
  initLegalModals();
});

/**
 * 1. Control de barra de navegación y menú móvil
 */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = navLinks.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', String(isExpanded));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/**
 * 2. Animaciones Fade-in / Slide-up al entrar en el viewport
 */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/**
 * 3. Selector interactivo de las 5 capturas reales de Visaltia Fiscal
 */
function initScreenshotTabs() {
  const tabs = document.querySelectorAll('.screen-tab');
  const screenImg = document.getElementById('active-screen-img');
  const screenCaption = document.getElementById('active-screen-caption');

  if (!tabs.length || !screenImg) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const newSrc = tab.getAttribute('data-screen');
      const newCaption = tab.getAttribute('data-caption');

      if (newSrc) {
        screenImg.style.opacity = '0.35';
        setTimeout(() => {
          screenImg.src = newSrc;
          if (screenCaption && newCaption) {
            screenCaption.textContent = newCaption;
          }
          screenImg.style.opacity = '1';
        }, 120);
      }
    });
  });
}

/**
 * 4. Preparación de botones de compra para futura pasarela (Stripe / PayPal)
 * IMPORTANTE: No almacena ni expone claves privadas ni tokens en el cliente.
 */
function initPaymentPlaceholders() {
  const paymentButtons = document.querySelectorAll('[data-checkout-plan]');
  const modal = document.getElementById('info-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  paymentButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const planCode = sanitizeInput(button.getAttribute('data-checkout-plan') || 'normal');
      const isAnnual = document.getElementById('billing-annual')?.classList.contains('active');
      const cycle = isAnnual ? 'anual' : 'mensual';

      /* ======================================================================
       * PUNTO DE INTEGRACIÓN FUTURA CON PASARELA DE PAGO (STRIPE / PAYPAL)
       * ----------------------------------------------------------------------
       * En producción, aquí se realizará una petición POST bajo HTTPS al
       * propio backend seguro (ej: https://api.visaltiafiscal.com/v1/checkout/session)
       * enviando únicamente { plan: planCode, billingCycle: cycle }.
       * El servidor creará la sesión con la clave secreta de Stripe/PayPal
       * y devolverá la URL de redirección segura (session.url).
       * ====================================================================== */

      if (modal && modalTitle && modalBody) {
        modalTitle.textContent = `Suscripción ${planCode.toUpperCase()} (${cycle})`;
        modalBody.textContent =
          `Has seleccionado el plan "${planCode.toUpperCase()}" en modalidad ${cycle}. ` +
          `La pasarela de pago (Stripe / PayPal) está preparada para activarse en producción. ` +
          `Mientras tanto, puedes solicitar acceso inmediato o una demo guiada desde el formulario de contacto.`;
        modal.classList.add('open');
      }
    });
  });
}

/**
 * ============================================================================
 * 5. SEGURIDAD Y FORMULARIO DE CONTACTO
 * ============================================================================
 */

/**
 * Sanitiza texto eliminando etiquetas HTML y codificando caracteres especiales
 * para prevenir ataques de inyección XSS (Cross-Site Scripting).
 * @param {string} rawValue
 * @returns {string}
 */
function sanitizeInput(rawValue) {
  if (typeof rawValue !== 'string') return '';
  // Eliminamos caracteres de control y etiquetas <script> o HTML
  const withoutTags = rawValue.replace(/<\/?[^>]+(>|$)/g, '');
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;'
  };
  return withoutTags.replace(/[&<>"'/`]/g, char => map[char]).trim();
}

/**
 * Valida formato de correo electrónico según estándar RFC 5322 simplificado
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Valida teléfono nacional o internacional (9 a 15 dígitos)
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s()-]/g, '');
  return /^\+?[0-9]{9,15}$/.test(cleaned);
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const feedbackBox = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Limpiar estados previos
    feedbackBox.className = 'form-feedback';
    feedbackBox.textContent = '';

    const rawName = document.getElementById('contact-name').value;
    const rawEmail = document.getElementById('contact-email').value;
    const rawPhone = document.getElementById('contact-phone').value;
    const rawMessage = document.getElementById('contact-message').value;
    const honeypot = document.getElementById('contact-website')?.value || '';

    // Protección anti-bots (Honeypot)
    if (honeypot.trim() !== '') {
      return;
    }

    // Sanitización contra inyección HTML/XSS antes de procesar
    const cleanData = {
      nombre: sanitizeInput(rawName),
      email: rawEmail.trim(),
      telefono: sanitizeInput(rawPhone),
      mensaje: sanitizeInput(rawMessage),
      timestamp: new Date().toISOString()
    };

    // Validación de campos
    let hasErrors = false;

    if (cleanData.nombre.length < 2) {
      setFieldError('contact-name', 'err-name', true);
      hasErrors = true;
    } else {
      setFieldError('contact-name', 'err-name', false);
    }

    if (!isValidEmail(cleanData.email)) {
      setFieldError('contact-email', 'err-email', true);
      hasErrors = true;
    } else {
      setFieldError('contact-email', 'err-email', false);
      cleanData.email = sanitizeInput(cleanData.email);
    }

    const trimmedPhone = rawPhone.trim();
    if (trimmedPhone.length > 0 && !isValidPhone(trimmedPhone)) {
      setFieldError('contact-phone', 'err-phone', true);
      hasErrors = true;
    } else {
      setFieldError('contact-phone', 'err-phone', false);
    }

    if (cleanData.mensaje.length < 10) {
      setFieldError('contact-message', 'err-message', true);
      hasErrors = true;
    } else {
      setFieldError('contact-message', 'err-message', false);
    }

    if (hasErrors) {
      feedbackBox.classList.add('error');
      feedbackBox.textContent = 'Por favor, revisa los campos marcados en rojo antes de enviar tu solicitud.';
      return;
    }

    // Envío real mediante FormSubmit.co bajo HTTPS a titoviewnext@gmail.com
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando solicitud segura...';

    try {
      const response = await fetch('https://formsubmit.co/ajax/titoviewnext@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `[Visaltia Fiscal Web] Nueva consulta de ${cleanData.nombre}`,
          _template: 'table',
          _captcha: 'false',
          Nombre_o_Empresa: cleanData.nombre,
          Email: cleanData.email,
          Telefono: cleanData.telefono || 'No indicado',
          Mensaje: cleanData.mensaje,
          Fecha_Envio: cleanData.timestamp
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === 'false' || result.success === false) {
        throw new Error(result.message || 'Error en la respuesta del servidor de correo');
      }

      feedbackBox.classList.add('success');
      feedbackBox.textContent =
        `¡Solicitud enviada con éxito, ${rawName.replace(/<\/?[^>]+(>|$)/g, '').trim()}! ` +
        `Hemos recibido tu consulta y te responderemos al correo indicado a la mayor brevedad.`;
      form.reset();
    } catch (error) {
      feedbackBox.classList.add('error');
      feedbackBox.textContent =
        'No se pudo procesar el envío automático en este momento. Por favor, inténtalo de nuevo o escríbenos directamente a titoviewnext@gmail.com.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}

function setFieldError(inputId, errorId, isError) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  if (!input || !errorEl) return;

  if (isError) {
    input.classList.add('is-invalid');
    errorEl.classList.add('visible');
  } else {
    input.classList.remove('is-invalid');
    errorEl.classList.remove('visible');
  }
}

/**
 * 6. Modales informativos (Textos legales y avisos)
 */
function initLegalModals() {
  const modal = document.getElementById('info-modal');
  const closeBtn = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const legalLinks = document.querySelectorAll('[data-legal]');

  const legalTexts = {
    aviso: {
      title: 'Aviso Legal — Visaltia Fiscal',
      body: 'Titular: Visaltia Software S.L. Plataforma SaaS de facturación electrónica compatible con reglamento Veri*factu (AEAT) y Ley Crea y Crece (Ley 18/2022). Todos los derechos de propiedad intelectual e industrial sobre Visaltia Fiscal y sus aplicaciones móviles asociadas están reservados.'
    },
    privacidad: {
      title: 'Política de Privacidad (RGPD / LOPDGDD)',
      body: 'Los datos recogidos en el formulario de contacto se emplean exclusivamente para responder a tu solicitud comercial o técnica sobre Visaltia Fiscal. No cedemos datos a terceros y toda la infraestructura se aloja en servidores europeos en Clouding.io bajo cifrado TLS/HTTPS.'
    },
    cookies: {
      title: 'Política de Cookies',
      body: 'Esta página web utiliza únicamente cookies técnicas esenciales para el correcto funcionamiento de la sesión y preferencias de visualización, sin rastreo publicitario invasivo de terceros.'
    }
  };

  legalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const key = link.getAttribute('data-legal');
      const content = legalTexts[key];
      if (content && modal && modalTitle && modalBody) {
        modalTitle.textContent = content.title;
        modalBody.textContent = content.body;
        modal.classList.add('open');
      }
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }
}
