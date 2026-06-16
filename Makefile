# ================= 配置区域 =================
# 镜像仓库地址和镜像名称
REGISTRY    ?= registry.cn-beijing.aliyuncs.com
NAMESPACE   ?= qqlx
IMAGE_NAME  ?= alertmanagerui

# 组合完整的镜像基础名称
IMAGE       := $(REGISTRY)/$(NAMESPACE)/$(IMAGE_NAME)

# ================= 动态变量获取 =================
# 获取当前 Git 分支名（例如 main 或 master）
BRANCH      := $(shell git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")

# 获取最新的 7 位 Git Commit Hash
GIT_SHA     := $(shell git rev-parse --short=7 HEAD 2>/dev/null || echo "unknown")

# 获取当前时间（格式：20260601-155722）
TIME_STAMP  := $(shell date +%Y%m%d-%H%m%S)

# 拼接最终的镜像 TAG（格式示例：main-f4a5874-20260601-155722）
IMAGE_TAG   := $(subst /,-,$(BRANCH))-$(GIT_SHA)-$(TIME_STAMP)

# ================= 伪目标声明 =================
.PHONY: all build push build-push show-tag

# 默认执行 build
all: build

# 显示即将生成的 Tag 名字（调试用）
show-tag:
	@echo "🎯 Target Image: $(IMAGE):$(IMAGE_TAG)"

# 1. 构建镜像
build: show-tag
	@echo "🔨 Starting docker build..."
	docker build -t $(IMAGE):$(IMAGE_TAG) .
	@echo "✅ Build completed successfully."

# 2. 推送镜像
push:
	@echo "🚀 Pushing image to registry..."
	docker push $(IMAGE):$(IMAGE_TAG)
	@echo "🎉 Push completed."

# 3. 一键构建并推送
build-push: build push