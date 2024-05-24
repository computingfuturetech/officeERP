FROM node:22-alpine3.18

WORKDIR /index

COPY package.json package-lock.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]
