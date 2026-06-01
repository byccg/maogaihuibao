/**
 * 戈壁家书 · 沉浸式纪念网站
 * script.js — 交互逻辑
 *
 * 包含：
 *  1. 家书模态框弹窗（支持多页图片横向滑动）
 *  2. 留言区提交反馈
 *  3. 淡入动画（IntersectionObserver）
 *  4. 移动端导航汉堡菜单
 *  5. 导航栏高亮当前区块
 *  6. 视频占位智能切换
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
      title: "钱三强 · 公务书信",
      image: "assets/images/letters/qiansanqiang-1.jpg",
      textFile: "assets/text/letters/qiansanqiang.txt",
    },
    qianxuesen: {
      title: "钱学森 · 师友书",
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
      title: "邓稼先 · 致友书",
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

  var modal           = $("#modal");
  var modalTitle      = $("#modalTitle");
  var modalGallery    = $("#modalGallery");
  var modalPageInd    = $("#modalPageIndicator");
  var modalText       = $("#modalText");
  var modalContent    = $(".modal-content");
  var closeBtn        = $("#closeModal");
  var letterTextCache = {};
  var openModalToken  = 0;
  var LETTER_TEXT_LOADING  = "家书内容加载中……";
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

  /** 解析 data-image 属性，支持逗号分隔的多页图片 */
  function parseImageList(raw) {
    if (!raw) return [];
    return raw
      .split(",")
      .map(function (p) { return normalizeAssetPath(p); })
      .filter(Boolean);
  }

  function getLetterData(id, triggerEl) {
    var normalizedId = letterDataAlias[id] || id;
    var dataFromMap = letterData[normalizedId];

    /* 从 DOM 读取可能存在的附加属性 */
    var extraImage = triggerEl ? triggerEl.getAttribute("data-image") : "";
    var scrollMode = triggerEl ? triggerEl.getAttribute("data-scroll") || "horizontal" : "horizontal";

    if (dataFromMap) {
      /* 合并 DOM 属性（DOM 优先） */
      return {
        title: dataFromMap.title,
        image: extraImage || dataFromMap.image || "",
        scrollMode: scrollMode,
        textFile: dataFromMap.textFile || "",
      };
    }

    if (!triggerEl) return null;
    var title = triggerEl.getAttribute("data-title");
    if (!title) return null;

    return {
      title: title,
      image: extraImage || "",
      scrollMode: scrollMode,
      textFile: letterTextFileById[normalizedId] || "",
    };
  }

  /** 渲染家书图片画廊（支持多页横向滑动 / 长图纵向滚动） */
  function renderGallery(imagePaths, title, scrollMode) {
    if (!modalGallery) return;
    modalGallery.innerHTML = "";

    /* 切换画廊的滚动模式 class */
    modalGallery.classList.remove("gallery-h", "gallery-v");
    if (scrollMode === "vertical") {
      modalGallery.classList.add("gallery-v");
    } else {
      modalGallery.classList.add("gallery-h");
    }
    if (modalContent) {
      modalContent.classList.toggle("gallery-v", scrollMode === "vertical");
    }

    if (imagePaths.length === 0) {
      if (modalPageInd) modalPageInd.textContent = "";
      return;
    }

    imagePaths.forEach(function (src, i) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = title + " 家书扫描件 · 第" + (i + 1) + "页";
      img.className = "modal-img";

      /* 单张图片加载失败时隐藏 */
      img.onerror = function () {
        this.style.display = "none";
      };
      img.onload = function () {
        this.style.display = "block";
      };

      modalGallery.appendChild(img);
    });

    /* 初始滚动位置 */
    modalGallery.scrollLeft = 0;
    modalGallery.scrollTop = 0;
    updatePageIndicator();
  }

  /** 更新页码指示器 */
  function updatePageIndicator() {
    if (!modalGallery || !modalPageInd) return;
    var imgs = modalGallery.querySelectorAll(".modal-img");
    var total = imgs.length;
    if (total <= 1) {
      modalPageInd.textContent = "";
      return;
    }

    /* 根据当前滚动位置计算当前页 */
    var scrollLeft = modalGallery.scrollLeft;
    var galleryWidth = modalGallery.clientWidth;
    var current = Math.round(scrollLeft / galleryWidth) + 1;
    if (current < 1) current = 1;
    if (current > total) current = total;
    modalPageInd.textContent = current + " / " + total;
  }

  async function openModal(id, triggerEl) {
    if (!modal) return;
    var data = getLetterData(id, triggerEl);
    if (!data) return;
    var token = ++openModalToken;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalText)  modalText.textContent  = LETTER_TEXT_LOADING;

    /* 解析多页图片 */
    var imagePaths = parseImageList(data.image);
    renderGallery(imagePaths, data.title, data.scrollMode);

    /* 监听画廊滚动以更新页码 */
    if (modalGallery) {
      modalGallery.onscroll = function () {
        updatePageIndicator();
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
     3. 留言区
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
