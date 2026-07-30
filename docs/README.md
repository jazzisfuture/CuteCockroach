# 西澳北线行程 · Coral Coast

跳过鲨鱼湾的 **10–11 天**珊瑚海岸自驾行程页（珀斯 → 尖石阵 → 卡尔巴里 → Exmouth / 宁格鲁）。

## 开启 GitHub Pages（必须手动点一次）

仓库里已有 `docs/index.html`。Actions **无法**自动首次开启 Pages，请按下面做：

1. 打开 [Pages 设置](https://github.com/jazzisfuture/CuteCockroach/settings/pages)
2. **Build and deployment → Source** 选 **Deploy from a branch**
3. Branch 选 **`main`**，Folder 选 **`/docs`**
4. 点 **Save**

约 1 分钟后访问：

**https://jazzisfuture.github.io/CuteCockroach/**

> 不要选 “GitHub Actions” 作为 Source（除非你之后自己加了可用的部署 workflow，并已在设置里手动启用过 Pages）。

## 页面包含

- Leaflet 互动路线图（点击标记联动日程）
- 嵌入式 Google 地图驾车路线
- 一键在 Google 地图打开完整导航
- 逐日住宿 / 车程说明

## 本地打开

```bash
python3 -m http.server 8080 --directory docs
```

然后访问 http://localhost:8080
