FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

# Copy everything except files listed in .dockerignore
COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]