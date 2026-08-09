// 顶部“新增”按钮 -> 弹窗内的Tab选项卡（大标题/小标题/新增内容/新增图片）
// 说明：本文件只负责“Tab栏在两个弹窗之间挪动 + 高亮 + 关闭另一侧弹窗”，
// 具体的新增逻辑仍由 main.js / image.js 中原有的按钮点击事件处理，未做任何改动。
(function () {
  document.addEventListener("DOMContentLoaded", init);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
  }

  function init() {
    const trigger = document.getElementById("addNewBtn");
    const tabsBar = document.getElementById("addNewTabs");
    const textSlot = document.getElementById("textModalTabsSlot");
    const imageSlot = document.getElementById("imageModalTabsSlot");
    const modalOverlay = document.getElementById("modalOverlay");
    const imageModal = document.getElementById("imageModal");

    if (!trigger || !tabsBar || !textSlot || !imageSlot || !modalOverlay || !imageModal) {
      return;
    }
    if (trigger.dataset.bound === "1") return; // 防止重复绑定
    trigger.dataset.bound = "1";

    const tabs = tabsBar.querySelectorAll(".add-new-tab");

    function highlight(tabName) {
      tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === tabName));
    }

    // 把Tab栏放进“文字新增弹窗”（大标题/小标题/新增内容），并关闭图片弹窗
    function showTextForm() {
      if (tabsBar.parentElement !== textSlot) textSlot.appendChild(tabsBar);
      imageModal.classList.remove("active");
    }

    // 把Tab栏放进“新增图片弹窗”，并关闭文字弹窗
    function showImageForm() {
      if (tabsBar.parentElement !== imageSlot) imageSlot.appendChild(tabsBar);
      modalOverlay.classList.remove("active");
    }

    // 点击顶部「新增」按钮：直接弹出弹窗，默认停在「大标题」Tab，无需再多点一次
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      highlight("main-title");
      showTextForm();
      if (typeof window.openAddModal === "function") {
        window.openAddModal("main-title");
      }
    });

    // 弹窗内切换Tab：只负责挪动Tab栏、关闭另一侧弹窗、更新高亮，
    // 实际打开对应表单的逻辑仍由各按钮自身已绑定的事件（main.js / image.js）处理
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = tab.dataset.tab;
        highlight(tabName);
        if (tabName === "images") {
          showImageForm();
        } else {
          showTextForm();
        }
      });
    });
  }
})();
