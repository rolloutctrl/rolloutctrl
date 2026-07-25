# ---- Builder stage ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn config set registry https://registry.npmjs.org && \
    yarn install \
      --frozen-lockfile \
      --network-timeout 600000 \
      --prefer-offline

COPY . .

ENV VITE_API_URL=/api
RUN yarn build

# ---- Runner stage ----
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
