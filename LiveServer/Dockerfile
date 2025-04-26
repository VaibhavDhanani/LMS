FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose the port your WebRTC server runs on
EXPOSE 8080

CMD ["node", "index.js"]