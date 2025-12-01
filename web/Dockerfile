FROM node:lts-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

# Copy everything except files listed in .dockerignore
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]