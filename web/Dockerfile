FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

ENV CHOKIDAR_USEPOLLING=true
ENV HOST=0.0.0.0

CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port 5173"]
