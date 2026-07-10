FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG API_URL=http://localhost:5000/api
RUN sed -i "s|__API_URL__|${API_URL}|g" src/environments/environment.prod.ts

RUN npm run build

FROM nginx:alpine

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY --from=build /app/dist/admin/browser /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
