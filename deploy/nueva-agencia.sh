#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Crea una agencia (o tienda) nueva en este VPS, con su propio dominio y sus datos aparte.
#
# Uso:
#   sudo deploy/nueva-agencia.sh <nombre-corto> <dominio> <puerto> [autos|tienda]
# Ejemplo:
#   sudo deploy/nueva-agencia.sh lopez autoslopez.com.ar 3001 autos
#   sudo deploy/nueva-agencia.sh esquina tiendalaesquina.com.ar 3002 tienda
#
# Antes: el dominio tiene que apuntar a la IP de este VPS (registro A).
# Opcional: CERTBOT_EMAIL=vos@mail.com para el aviso de vencimiento del certificado HTTPS.
# Agregá --simular al final para ver qué haría sin cambiar nada.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SIMULAR=0
ARGS=()
for a in "$@"; do [[ "$a" == "--simular" ]] && SIMULAR=1 || ARGS+=("$a"); done
set -- "${ARGS[@]:-}"

if [[ $# -lt 3 ]]; then
  sed -n '3,14p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

NOMBRE="$1"; DOMINIO="$2"; PUERTO="$3"; RUBRO="${4:-autos}"
BASE="${AGENCIAS_DIR:-/opt/agencias}"
DATOS_BASE="${AGENCIAS_DATOS:-/var/lib/agencias}"
DIR="$BASE/$NOMBRE"
DATOS="$DATOS_BASE/$NOMBRE"
ORIGEN="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${REPO_URL:-$(git -C "$ORIGEN" remote get-url origin)}"
RAMA="${RAMA:-$(git -C "$ORIGEN" rev-parse --abbrev-ref HEAD)}"

[[ "$NOMBRE" =~ ^[a-z0-9-]{2,30}$ ]] || { echo "El nombre corto solo puede tener minúsculas, números y guiones (ej. lopez)."; exit 1; }
[[ "$PUERTO" =~ ^[0-9]{4,5}$ ]] || { echo "El puerto tiene que ser un número (ej. 3001)."; exit 1; }
[[ "$RUBRO" == "autos" || "$RUBRO" == "tienda" ]] || { echo "El rubro tiene que ser autos o tienda."; exit 1; }
if [[ $SIMULAR == 0 ]]; then
  [[ -e "$DIR" ]] && { echo "Ya existe $DIR. Elegí otro nombre."; exit 1; }
  if command -v ss >/dev/null && ss -ltn | grep -q ":$PUERTO "; then echo "El puerto $PUERTO ya está en uso."; exit 1; fi
fi

correr() { if [[ $SIMULAR == 1 ]]; then echo "  [simulado] $*"; else eval "$@"; fi; }
ADMIN_PASS="$(openssl rand -base64 18 | tr -dc 'a-zA-Z0-9' | head -c 14)"
SECRETO="$(openssl rand -hex 32)"

echo "▶ Creando \"$NOMBRE\" ($RUBRO) en https://$DOMINIO (puerto $PUERTO)"

echo "1/6 Copiando el sistema en $DIR"
correr "mkdir -p '$BASE' '$DATOS'"
correr "git clone --branch '$RAMA' '$REPO' '$DIR'"

echo "2/6 Configuración (.env.local)"
ENV_CONTENIDO="ADMIN_USER=admin
ADMIN_PASSWORD=$ADMIN_PASS
ADMIN_NOMBRE=Administrador
SESSION_SECRET=$SECRETO
SITE_URL=https://$DOMINIO
DATA_DIR=$DATOS
NEXT_PUBLIC_RUBRO=$RUBRO
# Completar para que salgan los mails:
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
ADMIN_EMAIL="
if [[ $SIMULAR == 1 ]]; then echo "  [simulado] escribir $DIR/.env.local:"; echo "$ENV_CONTENIDO" | sed 's/^/      /'; else
  printf '%s\n' "$ENV_CONTENIDO" > "$DIR/.env.local"; chmod 600 "$DIR/.env.local"; fi

echo "3/6 Instalando y compilando (tarda unos minutos)"
correr "cd '$DIR' && npm ci --no-audit --no-fund && npm run build"

echo "4/6 Dejándola siempre prendida (PM2)"
correr "cd '$DIR' && TZ=America/Argentina/Rio_Gallegos NODE_ENV=production pm2 start node_modules/next/dist/bin/next --name '$NOMBRE' --cwd '$DIR' -- start -p '$PUERTO'"
correr "pm2 save"

echo "5/6 Publicándola en el dominio (nginx)"
NGINX="/etc/nginx/sites-available/$NOMBRE"
correr "sed -e 's/TUDOMINIO.com.ar/$DOMINIO/g' -e 's/PUERTO/$PUERTO/g' '$DIR/deploy/nginx.conf' > '$NGINX'"
correr "ln -sf '$NGINX' '/etc/nginx/sites-enabled/$NOMBRE'"
correr "nginx -t && systemctl reload nginx"

echo "6/6 HTTPS (certificado gratis)"
CORREO_CERT=$([[ -n "${CERTBOT_EMAIL:-}" ]] && echo "-m $CERTBOT_EMAIL" || echo "--register-unsafely-without-email")
correr "certbot --nginx -d '$DOMINIO' -d 'www.$DOMINIO' --non-interactive --agree-tos $CORREO_CERT --redirect || echo '  ⚠ No se pudo sacar el certificado. ¿El dominio ya apunta a este VPS? Reintentá con: certbot --nginx -d $DOMINIO'"

cat <<FIN

✔ Listo: https://$DOMINIO
  Panel:       https://$DOMINIO/admin
  Usuario:     admin
  Contraseña:  $ADMIN_PASS
  Datos en:    $DATOS
  Config en:   $DIR/.env.local  (completar SMTP para los mails; después: pm2 restart $NOMBRE)

Pasale el usuario y la contraseña al cliente. Desde el panel carga su marca, sus datos y sus empleados.
Para respaldos diarios: crontab -e →  15 4 * * * DATA_DIR=$DATOS RESPALDO_DIR=/var/backups/$NOMBRE $DIR/deploy/respaldo.sh
FIN
