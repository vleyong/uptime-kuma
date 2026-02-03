# 使用 Node 20 以满足 Uptime Kuma 2.1.0-beta 的要求
FROM node:20-bullseye AS build
WORKDIR /app

# 1. 安装所有依赖（包括前端编译工具 Vite）
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# 2. 拷贝你改好的源码并编译前端
COPY . .
RUN npm run build

# 3. 编译完成后，剔除开发依赖以缩小镜像体积
RUN npm prune --production

# --- 运行阶段 ---
FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production

# 只拷贝构建产物和必要的运行文件
COPY --from=build /app /app

EXPOSE 3001
VOLUME /app/data

# 启动服务器
CMD ["node", "server/server.js"]
