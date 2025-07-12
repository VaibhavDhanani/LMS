FROM node:18 AS builder

WORKDIR /app

ARG MODE=development
ENV NODE_ENV=$MODE

COPY package*.json ./
RUN npm install

COPY . .

RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM node:18 AS development

WORKDIR /app
COPY --from=builder /app /app

EXPOSE 5173
CMD ["npm", "run", "dev"]
