#!/usr/bin/env bash
# Copia diaria de los datos (autos, fotos, clientes, negocio) con 30 días de historial.
# Programarlo con: crontab -e  →  15 4 * * * /ruta/a/automotoresaro/deploy/respaldo.sh
set -euo pipefail
DATOS="${DATA_DIR:-$(dirname "$0")/../data}"
DESTINO="${RESPALDO_DIR:-$HOME/respaldos-automotoresaro}"
mkdir -p "$DESTINO"
tar -czf "$DESTINO/datos-$(date +%F).tar.gz" -C "$DATOS" .
find "$DESTINO" -name 'datos-*.tar.gz' -mtime +30 -delete
