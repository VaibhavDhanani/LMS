FROM node:latest

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ARG MODE=development

ENV NODE_ENV=${MODE}

CMD ["sh", "-c", "npm run $NODE_ENV"]
