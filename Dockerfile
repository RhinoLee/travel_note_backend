# 階段 1: 開發環境
FROM node:16-buster AS development

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y git && npm install

COPY . .

EXPOSE 5002

CMD ["npx", "nodemon", "-L", "./main.js" ]

# 階段 2: 生產環境
FROM node:16-buster AS production

WORKDIR /app

COPY package*.json ./

# 僅安裝 production 依賴
RUN npm install --only=production

COPY . .

EXPOSE 5002

CMD [ "node", "./main.js" ]