// 顶部右侧世界时钟：默认北京时间，点击可在 11 个时区之间切换
(function () {
  document.addEventListener("DOMContentLoaded", init);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
  }

  const STORAGE_KEY = "worldClockZone";
  const DEFAULT_ZONE = "Asia/Shanghai";
  const DEFAULT_LABEL = "北京时间";

  function init() {
    const wrapper = document.getElementById("worldClockWrapper");
    const trigger = document.getElementById("worldClockBtn");
    const menu = document.getElementById("worldClockMenu");
    const zoneLabelEl = document.getElementById("clockZoneLabel");
    const timeLabelEl = document.getElementById("clockTimeLabel");

    if (!wrapper || !trigger || !menu || !zoneLabelEl || !timeLabelEl) return;
    if (wrapper.dataset.bound === "1") return;
    wrapper.dataset.bound = "1";

    const options = menu.querySelectorAll(".world-clock-option");
    const optionTimeEls = Array.from(options).map((opt) => ({
      zone: opt.dataset.zone,
      el: opt.querySelector(".zone-time"),
    }));

    let currentZone = DEFAULT_ZONE;
    let currentLabel = DEFAULT_LABEL;

    // 尝试恢复上次选择的时区（若浏览器不支持 localStorage 则忽略）
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.zone && parsed.label) {
          currentZone = parsed.zone;
          currentLabel = parsed.label;
        }
      }
    } catch (e) {
      /* 忽略存储读取失败 */
    }

    function formatTime(zone) {
      try {
        return new Intl.DateTimeFormat("zh-CN", {
          timeZone: zone,
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date());
      } catch (e) {
        return "--:--:--";
      }
    }

    function tick() {
      timeLabelEl.textContent = formatTime(currentZone);
      optionTimeEls.forEach(({ zone, el }) => {
        if (el) el.textContent = formatTime(zone);
      });
    }

    function setActiveOption() {
      options.forEach((opt) => {
        opt.classList.toggle("active", opt.dataset.zone === currentZone);
      });
    }

    function selectZone(zone, label) {
      currentZone = zone;
      currentLabel = label;
      zoneLabelEl.textContent = label;
      setActiveOption();
      tick();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ zone, label }));
      } catch (e) {
        /* 忽略存储写入失败 */
      }
    }

    function positionMenu() {
      const rect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const gap = 8;
      let left = rect.right - menuRect.width;
      let top = rect.bottom + gap;

      if (left < 8) left = 8;
      const maxLeft = window.innerWidth - menuRect.width - 8;
      if (left > maxLeft) left = Math.max(8, maxLeft);
      if (top + menuRect.height > window.innerHeight) {
        top = Math.max(8, rect.top - gap - menuRect.height);
      }

      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
    }

    function openMenu() {
      wrapper.classList.add("open");
      menu.classList.add("active");
      positionMenu();
      requestAnimationFrame(positionMenu);
    }

    function closeMenu() {
      wrapper.classList.remove("open");
      menu.classList.remove("active");
    }

    function toggleMenu(e) {
      e.stopPropagation();
      if (wrapper.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    trigger.addEventListener("click", toggleMenu);

    options.forEach((opt) => {
      opt.addEventListener("click", () => {
        selectZone(opt.dataset.zone, opt.dataset.label);
        closeMenu();
      });
    });

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target) && !menu.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // 窗口尺寸变化时重新定位（顶部导航栏是 fixed 定位，
    // 页面/内容区域滚动不会移动按钮位置，因此无需在 scroll 时关闭菜单）
    window.addEventListener("resize", () => {
      if (wrapper.classList.contains("open")) positionMenu();
    });

    // 初始化显示与选中态
    zoneLabelEl.textContent = currentLabel;
    setActiveOption();
    tick();
    setInterval(tick, 1000);
  }
})();
