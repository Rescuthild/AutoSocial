# Headed Playwright runtime for a Linux server.
# Browsers run inside a virtual display (Xvfb) that can be viewed and
# controlled through noVNC, so platform logins can be done remotely.
FROM mcr.microsoft.com/playwright:v1.58.2-noble

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ffmpeg xvfb x11vnc novnc websockify fluxbox fonts-noto-color-emoji \
 && rm -rf /var/lib/apt/lists/*

ENV DISPLAY=:99
WORKDIR /app

COPY deploy/start.sh /usr/local/bin/autosocial-start
RUN chmod +x /usr/local/bin/autosocial-start

CMD ["/usr/local/bin/autosocial-start"]
