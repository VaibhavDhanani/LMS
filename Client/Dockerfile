FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV VITE_HOST=0.0.0.0
RUN npm run build
RUN npm install -g serve
# CMD [ "serve", "-s", "dist", "-l", "5173" ]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]