# Visaltia Fiscal — Web Oficial

Landing page corporativa de **Visaltia Fiscal**, software de facturación en la nube para pymes, autónomos y alojamientos turísticos compatible con **Veri*factu (AEAT)** y la **Ley Crea y Crece**, junto al escaparate del ecosistema de aplicaciones Android de Visaltia.

## 📁 Estructura del Proyecto

- `index.html`: Página principal completa (Hero, Beneficios, Características, Panel Clouding/Docker, Planes y Precios, Apps Android, Testimonios, Contacto y Footer).
- `css/styles.css`: Estilos modernos responsivos con variables CSS corporativas.
- `js/main.js`: Animaciones al hacer scroll, conmutador de precios, sanitización contra XSS y validación del formulario de contacto.

## 🚀 Cómo publicar la web

1. **GitHub Pages (Gratis e inmediato)**:
   - Ve a tu repositorio en GitHub → **Settings** → **Pages**.
   - En **Source**, selecciona `Deploy from a branch` y elige la rama `main` y la carpeta `/ (root)`.
   - Guarda y en 1 minuto tu web estará publicada con HTTPS automático.

2. **Servidor VPS en Clouding.io (Nginx / Apache o Docker)**:
   - Clona este repositorio en `/var/www/visaltiafiscal` en tu servidor de Clouding.io.
   - Configura Nginx apuntando a esa carpeta y activa el certificado SSL gratuito con `certbot --nginx -d tudominio.com`.
