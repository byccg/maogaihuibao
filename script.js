/**
 * 戈壁家书 · 沉浸式纪念网站
 * script.js — 交互逻辑
 *
 * 包含：
 *  1. 家书模态框弹窗
 *  2. WordCloud2 词云（优雅降级）
 *  3. 留言区提交反馈
 *  4. 淡入动画（IntersectionObserver）
 *  5. 移动端导航汉堡菜单
 *  6. 导航栏高亮当前区块
 *  7. 视频占位智能切换
 */

(function () {
  "use strict";

  /* ============================================================
     工具函数
  ============================================================ */

  /** 安全地获取 DOM 元素，未找到时不报错 */
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  /* ============================================================
     1. 家书数据
  ============================================================ */

  var letterData = {
    qiansanqiang: {
      title: "钱三强 · 家书",
      image: "assets/images/letters/qiansanqiang-1.jpg",
      textFile: "assets/text/letters/qiansanqiang.txt",
    },
    qianxuesen: {
      title: "钱学森 · 家书",
      image: "assets/images/letters/qianxuesen-1.jpg",
      textFile: "assets/text/letters/qianxuesen.txt",
    },
    yumin: {
      title: "于敏 · 家书",
      image: "assets/images/letters/yumin-1.jpg",
      textFile: "assets/text/letters/yumin.txt",
    },
    yaotongbin: {
      title: "姚桐斌 · 家书",
      image: "assets/images/letters/yaotongbin-1.jpg",
      textFile: "assets/text/letters/yaotongbin.txt",
    },
    deng: {
      title: "邓稼先 · 家书",
      image: "assets/images/letters/deng-1.jpg",
      textFile: "assets/text/letters/dengjiaxian.txt",
      text:
        "我的生命就献给未来的工作了。做好了，也不足为奇；不好，我也没脸见人。\n\n" +
        "我将来的命运就靠这件事了……我背井离乡、扔掉一切、委屈你和孩子，" +
        "是因为我知道，这是国家最需要我做的事，我必须这么做。\n\n" +
        "你若是真的爱我，就放开我的手，让我去做这件大事吧。",
    },
    guo: {
      title: "郭永怀 · 家书",
      image: "assets/images/letters/guo-1.jpg",
      textFile: "assets/text/letters/guoyonghuai.txt",
      text:
        "我回国的唯一目的，就是为祖国服务。\n\n" +
        "中国现在很穷，但是，将来的中国，必将远比美国进步。" +
        "我要回去为她服务……\n\n" +
        "我们是中国人，我们应该为中国人民服务。\n\n" +
        "——郭永怀，于归国前夕写给同事的信",
    },
  };
  var letterDataAlias = {
    dengjiaxian: "deng",
    guoyonghuai: "guo",
  };
  var letterTextFileById = {
    qiansanqiang: "assets/text/letters/qiansanqiang.txt",
    qianxuesen: "assets/text/letters/qianxuesen.txt",
    yumin: "assets/text/letters/yumin.txt",
    yaotongbin: "assets/text/letters/yaotongbin.txt",
    deng: "assets/text/letters/dengjiaxian.txt",
    guo: "assets/text/letters/guoyonghuai.txt",
  };

  /* ============================================================
     2. 模态框
  ============================================================ */

  var modal      = $("#modal");
  var modalTitle = $("#modalTitle");
  var modalImage = $("#modalImage");
  var modalText  = $("#modalText");
  var closeBtn   = $("#closeModal");
  var letterTextCache = {};
  var openModalToken = 0;
  var LETTER_TEXT_LOADING = "家书内容加载中……";
  var LETTER_TEXT_FALLBACK = "家书内容待补充。";

  function loadLetterText(data) {
    if (!data) return Promise.resolve("");
    if (!data.textFile) return Promise.resolve(data.text || "");
    if (letterTextCache[data.textFile]) return Promise.resolve(letterTextCache[data.textFile]);

    return fetch(data.textFile)
      .then(function (res) {
        if (!res.ok) throw new Error("failed to load text");
        return res.text();
      })
      .then(function (text) {
        var normalized = text.replace(/\r\n|\r/g, "\n");
        if (!normalized.trim()) throw new Error("empty text");
        letterTextCache[data.textFile] = normalized;
        return normalized;
      })
      .catch(function () {
        var fallbackText = data.text || LETTER_TEXT_FALLBACK;
        letterTextCache[data.textFile] = fallbackText;
        return fallbackText;
      });
  }

  function normalizeAssetPath(path) {
    if (typeof path !== "string") return "";
    var value = path.trim();
    if (!value) return "";
    if (value.indexOf("..") !== -1) return "";
    return /^assets\/[a-zA-Z0-9_./-]+$/.test(value) ? value : "";
  }

  function getLetterData(id, triggerEl) {
    var normalizedId = letterDataAlias[id] || id;
    var dataFromMap = letterData[normalizedId];
    if (dataFromMap) return dataFromMap;
    if (!triggerEl) return null;

    var title = triggerEl.getAttribute("data-title");
    var image = triggerEl.getAttribute("data-image");
    if (!title) return null;

    return {
      title: title,
      image: image || "",
      textFile: letterTextFileById[normalizedId] || "",
    };
  }

  async function openModal(id, triggerEl) {
    if (!modal) return;
    var data = getLetterData(id, triggerEl);
    if (!data) return;
    var token = ++openModalToken;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalText)  modalText.textContent  = LETTER_TEXT_LOADING;

    if (modalImage) {
      var safeImagePath = normalizeAssetPath(data.image);
      if (safeImagePath) {
        modalImage.src = safeImagePath;
      } else {
        modalImage.removeAttribute("src");
      }
      modalImage.alt = data.title + " 家书扫描件";

      /* 图片加载失败时，隐藏 img，显示占位文字 */
      modalImage.onerror = function () {
        this.style.display = "none";
        var wrap = this.parentNode;
        if (wrap) wrap.classList.add("img-load-fail");
      };
      modalImage.onload = function () {
        this.style.display = "block";
        var wrap = this.parentNode;
        if (wrap) wrap.classList.remove("img-load-fail");
      };
    }

    modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";

    /* 焦点移入模态框 */
    if (closeBtn) {
      setTimeout(function () { closeBtn.focus(); }, 60);
    }

    var loadedText = await loadLetterText(data);
    if (token !== openModalToken) return;
    if (modalText) modalText.textContent = loadedText;
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  /* 绑定家书卡片点击 */
  $$(".letter-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = this.getAttribute("data-id");
      if (id) openModal(id, this);
    });
  });

  /* 关闭按钮 */
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  /* 点击遮罩关闭 */
  var backdrop = $(".modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", closeModal);
  }

  /* ESC 键关闭 */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hasAttribute("hidden")) {
      closeModal();
    }
  });

  /* ============================================================
     3. WordCloud2 词云（优雅降级）
  ============================================================ */

  var wordList = [
    ["家国情怀", 36],
    ["隐姓埋名", 30],
    ["两弹一星", 34],
    ["奉献", 28],
    ["罗布泊", 24],
    ["科学报国", 30],
    ["信仰", 26],
    ["使命", 24],
    ["戈壁", 22],
    ["复兴", 26],
    ["忠诚", 22],
    ["星空", 20],
    ["牺牲", 20],
    ["自力更生", 26],
    ["核弹", 18],
    ["卫星", 18],
    ["氢弹", 18],
    ["原子弹", 20],
    ["东方红", 22],
    ["钱三强", 18],
    ["钱学森", 18],
    ["于敏", 18],
    ["姚桐斌", 18],
    ["邓稼先", 18],
    ["郭永怀", 18],
    ["爱国", 24],
    ["坚守", 20],
    ["报国", 22],
  ];

  function renderWordCloud() {
    var canvas = $("#wordcloud-container");
    if (!canvas) return;

    /* 检查 WordCloud 库是否已加载 */
    if (typeof window.WordCloud !== "function") {
      /* 优雅降级：显示 fallback 文字列表 */
      var fallback = $("#wordcloud-fallback");
      if (fallback) {
        fallback.removeAttribute("hidden");
        var ul = document.createElement("ul");
        ul.style.cssText =
          "list-style:none;display:flex;flex-wrap:wrap;gap:10px;padding:16px;justify-content:center";
        wordList.forEach(function (item) {
          var li = document.createElement("li");
          li.textContent = item[0];
          /* 暖金色调范围：30°（橙黄）~ 90°（黄绿） */
          var HUE_BASE  = 30;
          var HUE_RANGE = 60;
          li.style.cssText =
            "font-size:" +
            Math.max(item[1] * 0.45, 12) +
            "px;color:hsl(" +
            Math.floor(Math.random() * HUE_RANGE + HUE_BASE) +
            ",70%,65%);opacity:0.85";
          ul.appendChild(li);
        });
        fallback.innerHTML = "";
        fallback.appendChild(ul);
      }
      return;
    }

    try {
      window.WordCloud(canvas, {
        list: wordList,
        gridSize: Math.round((canvas.offsetWidth / 100) * 4),
        weightFactor: function (size) {
          return Math.max(size * 0.55, 10);
        },
        backgroundColor: "transparent",
        color: function () {
          /* 主题配色：暖金（42°/48°/30°）+ 深蓝（200°/210°） */
          var THEME_HUES = [42, 48, 200, 210, 30];
          var h = THEME_HUES[Math.floor(Math.random() * THEME_HUES.length)];
          return "hsl(" + h + ",70%," + (Math.random() * 20 + 55) + "%)";
        },
        rotateRatio: 0.2,
        shape: "circle",
        shrinkToFit: true,
        drawOutOfBound: false,
      });
    } catch (err) {
      /* 渲染失败时不报错 */
      console.warn("[WordCloud] 渲染失败:", err);
    }
  }

  /* 等待 DOM + 可能的 CDN 加载 */
  window.addEventListener("load", function () {
    renderWordCloud();
  });

  /* ============================================================
     4. 留言区
  ============================================================ */

  var sendBtn      = $("#sendBtn");
  var messageInput = $("#messageInput");
  var sendFeedback = $("#sendFeedback");

  if (sendBtn) {
    sendBtn.addEventListener("click", function () {
      if (!messageInput) return;
      var value = messageInput.value.trim();

      if (!value) {
        showFeedback("请先写下你想说的话 ✏️", "warn");
        return;
      }

      /* 成功反馈（实际静态站无后端，仅前端提示） */
      showFeedback("✨ 你的家书已寄往星空，他们一定会收到的。", "ok");
      messageInput.value = "";
    });
  }

  function showFeedback(msg, type) {
    if (!sendFeedback) return;
    sendFeedback.textContent = msg;
    sendFeedback.style.color =
      type === "ok" ? "var(--color-gold-lt)" : "#f4a261";

    clearTimeout(showFeedback._timer);
    sendFeedback._timer = setTimeout(function () {
      sendFeedback.textContent = "";
    }, 5000);
  }

  /* ============================================================
     5. 淡入动画（IntersectionObserver）
  ============================================================ */

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    $$(".fade-in").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    /* 不支持 IO 时直接显示 */
    $$(".fade-in").forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ============================================================
     6. 移动端汉堡菜单
  ============================================================ */

  var navToggle = $("#navToggle");
  var navInner  = $(".nav-inner");

  if (navToggle && navInner) {
    navToggle.addEventListener("click", function () {
      var isOpen = navInner.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    /* 点击导航链接后自动关闭菜单 */
    $$(".nav-inner a").forEach(function (link) {
      link.addEventListener("click", function () {
        navInner.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ============================================================
     7. 导航栏滚动高亮当前区块
  ============================================================ */

  var sections = $$("section[id]");
  var navLinks = $$(".nav-inner a");

  function updateActiveNav() {
    var scrollY = window.scrollY || window.pageYOffset;
    /* 从 CSS 变量或 navbar 高度动态读取，保持与 CSS 同步 */
    var navbar = $("#navbar");
    var navHeight = navbar ? navbar.offsetHeight : 64;
    var current = "";

    sections.forEach(function (sec) {
      var top = sec.offsetTop - navHeight - 60;
      if (scrollY >= top) {
        current = sec.id;
      }
    });

    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === "#" + current) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  /* ============================================================
     8. 视频占位智能切换
     当视频文件加载成功时，隐藏占位提示
  ============================================================ */

  $$(".section-video").forEach(function (video) {
    var wrap = video.parentNode;
    if (!wrap) return;

    /* 监听 canplay（能播放时）隐藏占位 */
    video.addEventListener("canplay", function () {
      wrap.classList.add("has-video");
    });

    /* 如果视频已经处于可播放状态（缓存等情况） */
    if (video.readyState >= 3) {
      wrap.classList.add("has-video");
    }
  });

})();
