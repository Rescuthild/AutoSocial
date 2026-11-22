#!/bin/sh
# Starts the virtual display, the VNC/noVNC viewer and the dashboard.
# The repository is mounted at /app, so runtime data (.env, .profiles,
# queue, state files) stays on the host next to the code.
set -e

VNC_PORT="${VNC_PORT:-5910}"
NOVNC_HOST="${NOVNC_HOST:-127.0.0.1}"
NOVNC_PORT="${NOVNC_PORT:-6085}"

rm -f /tmp/.X99-lock
Xvfb :99 -screen 0 1440x1000x24 -nolisten tcp >/dev/null 2>&1 &
sleep 1
fluxbox >/dev/null 2>&1 &
x11vnc -display :99 -forever -shared -nopw -listen 127.0.0.1 \
  -rfbport "$VNC_PORT" -quiet >/dev/null 2>&1 &
websockify --web /usr/share/novnc "$NOVNC_HOST:$NOVNC_PORT" \
  "127.0.0.1:$VNC_PORT" >/dev/null 2>&1 &

if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  npm ci --omit=dev
  touch node_modules
fi

exec node src/dashboard-server.js
