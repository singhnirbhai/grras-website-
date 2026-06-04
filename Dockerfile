FROM node:latest As builder
WORKDIR /app
COPY package*.json .
RUN ["npm","i"]

FROM  node:trixie-slim
WORKDIR /app
COPY --from=builder  /app   /app
COPY .  .
RUN apt-get update && apt-get install -y curl
CMD ["npm","run","dev"]