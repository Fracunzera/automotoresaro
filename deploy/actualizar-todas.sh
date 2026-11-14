#!/usr/bin/env bash
# Actualiza todas las agencias/tiendas instaladas con deploy/nueva-agencia.sh a la última versión.
# Uso: sudo deploy/actualizar-todas.sh            (todas)
#      sudo deploy/actualizar-todas.sh lopez       (solo una)
# Si una falla al compilar, se deja como estaba y se sigue con las demás.
set -uo pipefail
BASE="${AGENCIAS_DIR:-/opt/agencias}"
NOMBRES=("$@")
[[ ${#NOMBRES[@]} -eq 0 ]] && NOMBRES=($(ls -1 "$BASE"))
ERRORES=()

for NOMBRE in "${NOMBRES[@]}"; do
  DIR="$BASE/$NOMBRE"
  [[ -d "$DIR/.git" ]] || { echo "· $NOMBRE: no es una instalación, la salteo"; continue; }
  echo "▶ $NOMBRE"
  ANTES="$(git -C "$DIR" rev-parse HEAD)"
  if ! git -C "$DIR" pull --ff-only; then ERRORES+=("$NOMBRE (git pull)"); continue; fi
  if [[ "$(git -C "$DIR" rev-parse HEAD)" == "$ANTES" ]]; then echo "  ya estaba al día"; continue; fi
  # Se compila en una carpeta aparte y recién si sale bien se reemplaza la que está andando
  if (cd "$DIR" && npm ci --no-audit --no-fund && NEXT_DIST_DIR=.next-nueva npm run build); then
    rm -rf "$DIR/.next-vieja" && mv "$DIR/.next" "$DIR/.next-vieja" && mv "$DIR/.next-nueva" "$DIR/.next"
    pm2 restart "$NOMBRE" --update-env && rm -rf "$DIR/.next-vieja"
    echo "  ✔ actualizada"
  else
    echo "  ✖ falló la compilación: vuelvo a la versión anterior"
    git -C "$DIR" reset --hard "$ANTES" && (cd "$DIR" && npm ci --no-audit --no-fund) && rm -rf "$DIR/.next-nueva"
    ERRORES+=("$NOMBRE (build)")
  fi
done

[[ ${#ERRORES[@]} -gt 0 ]] && { echo; echo "Con errores: ${ERRORES[*]}"; exit 1; }
echo; echo "Todas al día."
