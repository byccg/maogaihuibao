# 《"两弹一星"元勋的戈壁家书》

沉浸式单页纪念网站——用现代 Web 技术重现那段隐姓埋名、以身许国的峥嵘岁月。

---

## 项目简介

本项目是一个可直接部署到 **GitHub Pages** 的静态单页网站，主题为"两弹一星"工程中科学家们的家书与精神。

**7 个核心区块：**

| 锚点 | 内容 |
|------|------|
| `#home` | 首页英雄区（全屏背景 + 标题） |
| `#background` | 时代背景（历史图文 + 视频） |
| `#journey` | 工程历程（横向时间轴） |
| `#letters` | 家书长廊（6 张弹窗卡片 + 词云） |
| `#theory` | 理论之光（三大理论成果） |
| `#outcome` | 辉煌结局（三大历史成果 + 视频） |
| `#interaction` | 致未来（留言互动区） |

---

## 目录结构

```
/
├── index.html              # 主页面
├── style.css               # 全局样式（深色沉浸式）
├── script.js               # 交互逻辑
├── README.md               # 本文档
└── assets/
    ├── images/
    │   ├── home/
    │   │   └── bg-home.jpg             # 首页背景（戈壁滩+星空）
    │   ├── background/
    │   │   ├── mao-quote.jpg           # 领袖决断历史照
    │   │   ├── coldwar-map.jpg         # 冷战形势图
    │   │   └── 1950s-china.jpg         # 50年代工业场景
    │   ├── journey/
    │   │   ├── timeline-1964.jpg       # 原子弹爆炸蘑菇云
    │   │   ├── timeline-1967.jpg       # 氢弹试验
    │   │   └── timeline-1970.jpg       # 东方红一号卫星
    │   ├── letters/
    │   │   ├── deng-1.jpg              # 邓稼先家书
    │   │   ├── guo-1.jpg               # 郭永怀家书
    │   │   ├── wang-1.jpg              # 王淦昌家书
    │   │   ├── peng-1.jpg              # 彭桓武家书
    │   │   └── zhu-1.jpg               # 朱光亚家书
    │   ├── outcome/
    │   │   ├── success-1.jpg           # 科学家欢呼合影
    │   │   ├── satellite.jpg           # 东方红一号模型
    │   │   └── legacy.jpg              # 神舟/北斗现代图
    │   └── interaction/
    │       └── future-bg.jpg           # 留言区背景（星空+信纸）
    ├── text/
    │   └── letters/
    │       ├── qiansanqiang.txt          # 钱三强家书文本
    │       ├── qianxuesen.txt            # 钱学森家书文本
    │       ├── yumin.txt                 # 于敏家书文本
    │       ├── yaotongbin.txt            # 姚桐斌家书文本
    │       ├── guoyonghuai.txt           # 郭永怀家书文本
    │       └── dengjiaxian.txt           # 邓稼先家书文本
    └── videos/
        ├── background.mp4              # 时代背景视频
        ├── journey.mp4                 # 工程历程动画
        ├── letters.mp4                 # 家书沉浸视频
        └── outcome.mp4                 # 成果混剪视频
```

> **注意：** 所有图片和视频文件**需要你自行准备并上传**。  
> 文件缺失时，页面会显示占位提示（如"图片待上传""视频待上传"），**不会报错**。

---

## 需要自行准备的资源

### 图片资源（建议 JPG，≤ 500 KB）

| 文件路径 | 说明 | 建议尺寸 |
|----------|------|---------|
| `assets/images/home/bg-home.jpg` | 首页背景，戈壁滩+星空 | 1920×1080 |
| `assets/images/background/mao-quote.jpg` | 领袖决断历史照 | 800×600 |
| `assets/images/background/coldwar-map.jpg` | 冷战形势简图 | 800×600 |
| `assets/images/background/1950s-china.jpg` | 50年代工业场景 | 800×600 |
| `assets/images/journey/timeline-1964.jpg` | 原子弹爆炸 | 800×600 |
| `assets/images/journey/timeline-1967.jpg` | 氢弹试验 | 800×600 |
| `assets/images/journey/timeline-1970.jpg` | 东方红一号 | 800×600 |
| `assets/images/letters/deng-1.jpg` | 邓稼先家书扫描 | 600×800 |
| `assets/images/letters/guo-1.jpg` | 郭永怀家书扫描 | 600×800 |
| `assets/images/letters/wang-1.jpg` | 王淦昌家书扫描 | 600×800 |
| `assets/images/letters/peng-1.jpg` | 彭桓武家书扫描 | 600×800 |
| `assets/images/letters/zhu-1.jpg` | 朱光亚家书扫描 | 600×800 |
| `assets/images/outcome/success-1.jpg` | 科学家合影 | 800×600 |
| `assets/images/outcome/satellite.jpg` | 卫星模型 | 800×600 |
| `assets/images/outcome/legacy.jpg` | 航天现代图 | 800×600 |
| `assets/images/interaction/future-bg.jpg` | 星空信纸背景 | 1920×1080 |

### 视频资源（MP4 格式，建议 ≤ 30 MB）

| 文件路径 | 说明 |
|----------|------|
| `assets/videos/background.mp4` | 时代背景纪录片混剪（≤ 30 秒） |
| `assets/videos/journey.mp4` | 工程历程时间轴动画（≤ 15 秒） |
| `assets/videos/letters.mp4` | 家书沉浸视频（≤ 20 秒） |
| `assets/videos/outcome.mp4` | 成果混剪（≤ 25 秒） |

---

## 本地预览

直接用浏览器打开 `index.html` 即可预览。  
推荐使用 VSCode 的 **Live Server** 插件，或运行：

```bash
# Python 3
python3 -m http.server 8080
# 然后访问 http://localhost:8080
```

---

## GitHub Pages 部署步骤

1. 将整个项目文件夹上传至 GitHub 仓库（或直接 push）。
2. 进入仓库页面，点击 **Settings**。
3. 左侧找到 **Pages**。
4. **Source** 选择 `Deploy from a branch`，Branch 选择 `main`，目录选 `/ (root)`。
5. 点击 **Save**，稍等约 1 分钟。
6. 页面会提示已部署到 `https://<用户名>.github.io/<仓库名>/`。

---

## 技术说明

- **纯静态**：无需构建工具，无需 Node.js。
- **词云**：使用 [WordCloud2.js](https://github.com/timdream/wordcloud2.js)（CDN 加载，不可用时自动降级）。
- **响应式**：支持桌面、平板、手机三种尺寸自适应。
- **无障碍**：导航使用 `aria-label`，模态框使用 `role="dialog"`，键盘可操作（ESC 关闭）。

---

## 版权说明

本项目为教育纪念性质。引用的历史文献、讲话摘录等均为公开历史资料。  
如需使用图片/视频，请确认资源版权，优先使用公开授权的历史档案素材。
