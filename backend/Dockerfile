FROM node:lts-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

# Copy everything except files listed in .dockerignore
COPY . .

# Generate Prisma client
RUN npm run prisma generate

# Build the application
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]