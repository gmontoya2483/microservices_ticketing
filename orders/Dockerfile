FROM node:alpine
LABEL authors="Gabriel"

WORKDIR /app
COPY package.json .
COPY package-lock.json .

RUN npm config set strict-ssl false
RUN npm install --omit=dev

COPY . .



CMD ["npm", "run", "start:dev"]