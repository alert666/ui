FROM registry.cn-beijing.aliyuncs.com/qqlx/node:24.15.0-alpine AS builder

WORKDIR /app

# 配置镜像源加速
RUN yarn config set registry https://registry.npmmirror.com

# 拷贝依赖描述文件
COPY package.json yarn.lock* ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 拷贝源码
COPY . .

RUN yarn build

# ================= 运行阶段 =================
FROM registry.cn-beijing.aliyuncs.com/qqlx/nginx:1.28.0-otel

# 拷贝打包产物
COPY --from=builder /app/dist /data/html/apiserver/

COPY nginx.conf /etc/nginx/nginx.conf
COPY alert.conf /etc/nginx/conf.d/alert.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]