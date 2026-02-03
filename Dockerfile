FROM node:18-bullseye AS build
WORKDIR /app

# 1. 安装依赖 (加入参数解决冲突)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# 2. 拷贝你改过的源码 (包含 webhook.js 等)
COPY . .

# 3. 编译前端 (同样建议加入参数)
RUN npm run build --legacy-peer-deps

# 4. 最终运行阶段
FROM node:18-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production

# 从构建阶段拷贝编译好的文件
COPY --from=build /app /app

EXPOSE 3001
VOLUME /app/data

# 启动命令
CMD ["node", "server/server.js"]
