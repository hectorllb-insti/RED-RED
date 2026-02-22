# ============================================================
# RED-RED Frontend — Dockerfile
# React (CRA) con react-scripts — Node 20 LTS
# ============================================================

FROM node:20-alpine

# Evitar prompts interactivos durante npm install
ENV CI=false \
    NODE_ENV=development

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias (usar npm para respetar package-lock.json)
RUN npm install --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Puerto expuesto por react-scripts
EXPOSE 3000

# HOST=0.0.0.0 es necesario para que el servidor escuche en todas las interfaces
# dentro del contenedor. Sobreescribe el "set HOST=0.0.0.0&&" de Windows.
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["npx", "react-scripts", "start"]
