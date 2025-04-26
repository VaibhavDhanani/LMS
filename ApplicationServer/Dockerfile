FROM node:latest

WORKDIR /app

COPY pack*.json ./

RUN npm install 

COPY . .

EXPOSE 5000

CMD [ "npm", "run", "dev" ]
