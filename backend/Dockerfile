FROM node:24-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p /data

ENV DB_PATH=/data/monotributo.db
ENV PORT=3001

EXPOSE 3001

CMD ["node", "server.js"]
