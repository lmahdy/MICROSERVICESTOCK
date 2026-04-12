FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ src/

RUN npm run build

EXPOSE 8087

CMD ["node", "dist/main.js"]
