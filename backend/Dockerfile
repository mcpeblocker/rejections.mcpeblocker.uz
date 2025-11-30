FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Hardcode environment variables for production
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm","start"]