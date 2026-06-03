"""
图片批量压缩工具 - 压缩项目中的所有JPG图片
策略：调整尺寸 + 智能压缩，保存为压缩版JPG + WebP
"""
import os
from PIL import Image
import json

# 项目根目录
ROOT = r"c:\Users\liupu\Desktop\毛概课堂汇报\网站\maogaihuibao-main"

# 图片压缩配置：{相对路径: (最大宽度, JPG质量, WebP质量)}
IMAGE_CONFIG = {
    # 超大图片 - 首页背景，视觉为主
    "assets/images/home/bg-home.jpg": (1920, 70, 70),
    # 超大图片 - 家书扫描件，需要清晰度
    "assets/images/letters/qiansanqiang-1.jpg": (1200, 82, 82),
    # 大图片 - 内容插图
    "assets/images/outcome/legacy.jpg": (1200, 75, 75),
    "assets/images/outcome/success-1.jpg": (1200, 75, 75),
    # 中等图片 - 内容插图
    "assets/images/background/1950s-china.jpg": (1000, 78, 78),
    "assets/images/background/coldwar-map.jpg": (1000, 78, 78),
    "assets/images/background/mao-quote.jpg": (1000, 78, 78),
    "assets/images/letters/deng-1.jpg": (1000, 80, 80),
    "assets/images/letters/deng-2.jpg": (1000, 80, 80),
    "assets/images/letters/guo-1.jpg": (1000, 80, 80),
    "assets/images/letters/qianxuesen-1.jpg": (1000, 80, 80),
    "assets/images/letters/yaotongbin-1.jpg": (1000, 80, 80),
    "assets/images/letters/yumin-1.jpg": (1000, 80, 80),
    "assets/images/outcome/satellite.jpg": (1000, 78, 78),
    "assets/images/outcome/gongxun.jpg": (800, 80, 80),
    # 小图片 - 时间线缩略图
    "assets/images/journey/timeline-1955.jpg": (600, 78, 78),
    "assets/images/journey/timeline-1964.jpg": (600, 78, 78),
    "assets/images/journey/timeline-1967.jpg": (600, 78, 78),
    "assets/images/journey/timeline-1970.jpg": (600, 78, 78),
    # 致未来背景
    "assets/images/interaction/future-bg.jpg": (1200, 72, 72),
}

stats = {"total_before": 0, "total_after_jpg": 0, "total_after_webp": 0, "files": []}

for rel_path, (max_width, jpg_quality, webp_quality) in IMAGE_CONFIG.items():
    full_path = os.path.join(ROOT, rel_path)
    if not os.path.exists(full_path):
        print(f"[SKIP] Not found: {rel_path}")
        continue

    size_before = os.path.getsize(full_path)
    img = Image.open(full_path)

    # 转换 RGBA/PNG 为 RGB
    if img.mode in ("RGBA", "P", "LA"):
        img = img.convert("RGB")
    elif img.mode == "CMYK":
        img = img.convert("RGB")

    orig_w, orig_h = img.size

    # 调整尺寸（保持宽高比）
    if orig_w > max_width:
        ratio = max_width / orig_w
        new_size = (max_width, int(orig_h * ratio))
        img = img.resize(new_size, Image.LANCZOS)
        resized_w, resized_h = new_size
    else:
        resized_w, resized_h = orig_w, orig_h

    # 保存压缩后的 JPG（覆盖原文件）
    img.save(full_path, "JPEG", quality=jpg_quality, optimize=True)
    size_after_jpg = os.path.getsize(full_path)

    # 保存 WebP 版本
    webp_path = full_path.rsplit(".", 1)[0] + ".webp"
    img.save(webp_path, "WEBP", quality=webp_quality)
    size_after_webp = os.path.getsize(webp_path)

    pct_jpg = (1 - size_after_jpg / size_before) * 100
    pct_webp = (1 - size_after_webp / size_before) * 100

    stats["total_before"] += size_before
    stats["total_after_jpg"] += size_after_jpg
    stats["total_after_webp"] += size_after_webp
    stats["files"].append({
        "path": rel_path,
        "orig": f"{orig_w}x{orig_h}",
        "resized": f"{resized_w}x{resized_h}",
        "before_kb": size_before // 1024,
        "after_jpg_kb": size_after_jpg // 1024,
        "after_webp_kb": size_after_webp // 1024,
        "saved_jpg_pct": round(pct_jpg, 1),
        "saved_webp_pct": round(pct_webp, 1),
    })

    print(f"[OK] {rel_path}")
    print(f"  {orig_w}x{orig_h} → {resized_w}x{resized_h} | "
          f"{size_before//1024}KB → JPG:{size_after_jpg//1024}KB (-{pct_jpg:.0f}%) "
          f"| WebP:{size_after_webp//1024}KB (-{pct_webp:.0f}%)")

# 汇总
print(f"\n{'='*60}")
total_saved_jpg = (1 - stats["total_after_jpg"] / stats["total_before"]) * 100
total_saved_webp = (1 - stats["total_after_webp"] / stats["total_before"]) * 100
print(f"总压缩前: {stats['total_before']//1024}KB ({stats['total_before']//1048576}MB)")
print(f"JPG 压缩后: {stats['total_after_jpg']//1024}KB ({stats['total_after_jpg']//1048576}MB) - 节省 {total_saved_jpg:.0f}%")
print(f"WebP 压缩后: {stats['total_after_webp']//1024}KB ({stats['total_after_webp']//1048576}MB) - 节省 {total_saved_webp:.0f}%")

# 保存统计
with open(os.path.join(ROOT, "compress_stats.json"), "w", encoding="utf-8") as f:
    json.dump(stats, f, ensure_ascii=False, indent=2)
