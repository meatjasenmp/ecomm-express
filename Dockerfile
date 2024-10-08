FROM oven/bun:alpine

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

RUN bun install

COPY .. .

CMD bun run dev
EXPOSE 8080