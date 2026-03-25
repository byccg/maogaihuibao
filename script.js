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
    deng: {
      title: "邓稼先 · 1964年",
      image: "assets/images/letters/deng-1.jpg",
      text:
        "我的生命就献给未来的工作了。做好了，也不足为奇；不好，我也没脸见人。\n\n" +
        "我将来的命运就靠这件事了……我背井离乡、扔掉一切、委屈你和孩子，" +
        "是因为我知道，这是国家最需要我做的事，我必须这么做。\n\n" +
        "你若是真的爱我，就放开我的手，让我去做这件大事吧。",
    },
    guo: {
      title: "郭永怀 · 归国家书",
      image: "assets/images/letters/guo-1.jpg",
      text:
        "我回国的唯一目的，就是为祖国服务。\n\n" +
        "中国现在很穷，但是，将来的中国，必将远比美国进步。" +
        "我要回去为她服务……\n\n" +
        "我们是中国人，我们应该为中国人民服务。\n\n" +
        "——郭永怀，于归国前夕写给同事的信",
    },
    wang: {
      title: "王淦昌 · 家书",
      image: "assets/images/letters/wang-1.jpg",
      text:
        "愿以身许国，不负年华。\n\n" +
        "我虽已改名换姓，但在这片戈壁荒滩上，" +
        "每个人都清楚我们在做什么，为什么而做。\n\n" +
        "为了这个国家，为了这片土地上的人民，再苦再难，也值得。\n\n" +
        "希望你们在家里平平安安，等我完成任务归来。",
    },
    peng: {
      title: "彭桓武 · 家书",
      image: "assets/images/letters/peng-1.jpg",
      text:
        "国家需要我，我便去做。\n\n" +
        "这是我的选择，也是我的责任。" +
        "家人的牵挂是我前行的动力，但国家的需要高于一切。\n\n" +
        "等到任务完成的那天，我一定回来好好陪伴你们。\n\n" +
        "请不要担心我，这里的同志们都很好，我们彼此照应。",
    },
    zhu: {
      title: "朱光亚 · 致同学书",
      image: "assets/images/letters/zhu-1.jpg",
      text:
        "朋友们，我们都是中国人。\n\n" +
        "我们离开家乡，来到外国求学，学成以后，就应该回去报效祖国。\n\n" +
        "科学无国界，但科学家有祖国。" +
        "祖国正在等待我们，我们需要回去建设她。\n\n" +
        "我要回去了，愿有志于此的同学和我一起踏上归途。\n\n" +
        "——朱光亚，1950年于美国",
    },
  };

  /* ============================================================
     2. 模态框
  ============================================================ */

  var modal      = $("#modal");
  var modalTitle = $("#modalTitle");
  var modalImage = $("#modalImage");
  var modalText  = $("#modalText");
  var closeBtn   = $("#closeModal");

  function openModal(id) {
    if (!modal) return;
    var data = letterData[id];
    if (!data) return;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalText)  modalText.textContent  = data.text;

    if (modalImage) {
      modalImage.src = data.image;
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
      if (id) openModal(id);
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
    ["邓稼先", 18],
    ["郭永怀", 18],
    ["王淦昌", 16],
    ["彭桓武", 16],
    ["朱光亚", 16],
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
