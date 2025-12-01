FROM node:lts-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

# Copy everything except files listed in .dockerignore
COPY . .

# Build the Next.js application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]