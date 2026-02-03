FROM node:18-bullseye AS build
WORKDIR /app

# 1. 优先安装依赖（利用 Docker 缓存）
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 2. 拷贝你修改后的所有源码（包含你改过的 webhook.js）
COPY . .

# 3. 编译前端（这是最耗时的一步）
RUN npm run build

# 4. 运行阶段
FROM node:18-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production

# 从 build 阶段拷贝所有文件
COPY --from=build /app /app

EXPOSE 3001
VOLUME /app/data

# 启动命令
CMD ["node", "server/server.js"]
