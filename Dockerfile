FROM node:18-alpine

WORKDIR /app

# 复制 package.json 和安装依赖
COPY package*.json ./
RUN npm ci

# 复制项目代码
COPY . .

# 构建应用
RUN npm run build

# 启动生产版本
EXPOSE 3000
CMD ["npm", "start"]
