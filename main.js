// 存储所有内容项数据 - 初始从本地存储加载或为空数组
let contentItems = JSON.parse(localStorage.getItem("contentSystemData")) || [];
let nextItemId = parseInt(localStorage.getItem("contentSystemNextItemId")) || 1;
let nextContentItemId =
  parseInt(localStorage.getItem("contentSystemNextContentItemId")) || 101;

// --- 在这里插入鼠标波纹动效配置 ---
const RIPPLE_CONFIG = {
  maxRipples: 20, // 最大同时存在的波纹数
  baseSize: 80, // 基础大小
  speedFactor: 3, // 速度感应系数
  maxSize: 400, // 最大扩散尺寸
  animationDuration: 1200, // 持续时间
};

let rippleCount = 0;
let lastX = 0,
  lastY = 0;
let lastTime = 0;

// 当前选中的背景 - 从本地存储加载
let currentBackground = JSON.parse(
  localStorage.getItem("contentSystemBackground"),
) || {
  type: "none",
  src: "",
  isLocalFile: false,
};

// 透明度设置 - 从本地存储加载
let backgroundOpacity =
  parseInt(localStorage.getItem("contentSystemOpacity")) || 80;
let overlayOpacity =
  parseInt(localStorage.getItem("contentSystemOverlayOpacity")) || 80;

// 主题模式 - 从本地存储加载
// 主题模式 - 默认设为浅色模式（白色主题）
let isLightMode =
  localStorage.getItem("contentSystemTheme") === "light" || true;
// 如果本地存储没有值，则使用浅色模式
if (localStorage.getItem("contentSystemTheme") === null) {
  isLightMode = true;
  localStorage.setItem("contentSystemTheme", "light");
}

// DOM元素
const navItemsContainer = document.getElementById("navItems");
const contentContainer = document.getElementById("contentContainer");
const emptyState = document.getElementById("emptyState");
const addMainTitleBtn = document.getElementById("addMainTitleBtn");
const addSubtitleBtn = document.getElementById("addSubtitleBtn");
const addContentBtn = document.getElementById("addContentBtn");
const backgroundSelectorBtn = document.getElementById("backgroundSelectorBtn");
const opacityControlBtn = document.getElementById("opacityControlBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const formLabel = document.getElementById("formLabel");
const textareaContainer = document.getElementById("textareaContainer");
const addMoreBtn = document.getElementById("addMoreBtn");
const submitBtn = document.getElementById("submitBtn");
const closeModal = document.getElementById("closeModal");
const contentForm = document.getElementById("contentForm");
const copyNotification = document.getElementById("copyNotification");
const contextMenu = document.getElementById("contextMenu");
const editContextItem = document.getElementById("editContextItem");
const addContextItem = document.getElementById("addContextItem");
const deleteContextItem = document.getElementById("deleteContextItem");
const insertAfterContextItem = document.getElementById(
  "insertAfterContextItem",
);

// 背景相关元素
const backgroundModal = document.getElementById("backgroundModal");
const closeBackgroundModal = document.getElementById("closeBackgroundModal");
const backgroundTabs = document.querySelectorAll(".background-tab");
const backgroundOptions = document.getElementById("backgroundOptions");
const fileUploadArea = document.getElementById("fileUploadArea");
const backgroundFileInput = document.getElementById("backgroundFileInput");
const uploadPreview = document.getElementById("uploadPreview");
const customBackgroundInput = document.getElementById("customBackgroundInput");
const customPreview = document.getElementById("customPreview");
const applyBackgroundBtn = document.getElementById("applyBackgroundBtn");
const cancelBackgroundBtn = document.getElementById("cancelBackgroundBtn");
const backgroundMedia = document.getElementById("background-media");
const backgroundVideo = document.getElementById("background-video");
const backgroundOverlay = document.getElementById("background-overlay");

// 透明度相关元素
const opacityModal = document.getElementById("opacityModal");
const closeOpacityModal = document.getElementById("closeOpacityModal");
const opacitySlider = document.getElementById("opacitySlider");
const opacityValue = document.getElementById("opacityValue");
const opacityPresetBtns = document.querySelectorAll(".opacity-preset-btn");
const applyOpacityBtn = document.getElementById("applyOpacityBtn");
const cancelOpacityBtn = document.getElementById("cancelOpacityBtn");

// 导入导出相关元素
const importExportModal = document.getElementById("importExportModal");
const closeImportExportModal = document.getElementById(
  "closeImportExportModal",
);
const importExportTabs = document.querySelectorAll(".import-export-tab");
const exportDataPreview = document.getElementById("exportDataPreview");
const importFileArea = document.getElementById("importFileArea");
const importFileInput = document.getElementById("importFileInput");
const importPreview = document.getElementById("importPreview");
const exportActionBtn = document.getElementById("exportActionBtn");
const importActionBtn = document.getElementById("importActionBtn");
const cancelImportExportBtn = document.getElementById("cancelImportExportBtn");

// 自动隐藏相关元素
const autoHideTimeInput = document.getElementById("autoHideTimeInput");
const enableAutoHide = document.getElementById("enableAutoHide");

// 插入菜单项元素
const insertMainTitleAfterItem = document.getElementById(
  "insertMainTitleAfterItem",
);
const insertSubtitleAfterItem = document.getElementById(
  "insertSubtitleAfterItem",
);

// 状态变量
let currentItemType = "";
let currentEditItemId = null;
let currentHighlightedItem = null;
let currentEditCardItemId = null;
let currentContentCardId = null;
let contextMenuTarget = null;
let currentImportExportTab = "export";
let currentInsertAfterId = null;

let nextImageId =
  parseInt(localStorage.getItem("contentSystemNextImageId")) || 1001;

// 图片相关DOM元素
const addImagesBtn = document.getElementById("addImagesBtn");
const imageModal = document.getElementById("imageModal");
const imageModalTitle = document.getElementById("imageModalTitle");
const closeImageModal = document.getElementById("closeImageModal");
const imageForm = document.getElementById("imageForm");
const imageUploadArea = document.getElementById("imageUploadArea");
const imageFileInput = document.getElementById("imageFileInput");
const imagePreviewArea = document.getElementById("imagePreviewArea");
const imageUrlInput = document.getElementById("imageUrlInput");
const submitImageBtn = document.getElementById("submitImageBtn");
const insertImagesAfterItem = document.getElementById("insertImagesAfterItem");

// 图片查看器相关DOM元素
const imageViewerModal = document.getElementById("imageViewerModal");
const closeImageViewer = document.getElementById("closeImageViewer");
const viewerImage = document.getElementById("viewerImage");
const prevImageBtn = document.getElementById("prevImageBtn");
const nextImageBtn = document.getElementById("nextImageBtn");
const currentImageIndex = document.getElementById("currentImageIndex");
const totalImages = document.getElementById("totalImages");
const downloadImageBtn = document.getElementById("downloadImageBtn");
const copyImageUrlBtn = document.getElementById("copyImageUrlBtn");
const deleteImageBtn = document.getElementById("deleteImageBtn");

// 图片查看器状态
let currentViewingImages = [];
let currentViewingImageIndex = 0;
let currentViewingCardId = null;

// 自动隐藏相关变量
let autoHideEnabled = localStorage.getItem("contentSystemAutoHide") === "true";
let autoHideTime =
  parseInt(localStorage.getItem("contentSystemAutoHideTime")) || 20;
let hideTimeout = null;
let mouseInWindow = true;

// 保存数据到本地存储
function saveToLocalStorage() {
  localStorage.setItem("contentSystemData", JSON.stringify(contentItems));
  localStorage.setItem("contentSystemNextItemId", nextItemId.toString());
  localStorage.setItem(
    "contentSystemNextContentItemId",
    nextContentItemId.toString(),
  );
  localStorage.setItem(
    "contentSystemBackground",
    JSON.stringify(currentBackground),
  );
  localStorage.setItem("contentSystemOpacity", backgroundOpacity.toString());
  localStorage.setItem(
    "contentSystemOverlayOpacity",
    overlayOpacity.toString(),
  );
  localStorage.setItem("contentSystemTheme", isLightMode ? "light" : "dark");
  localStorage.setItem("contentSystemAutoHide", autoHideEnabled.toString());
  localStorage.setItem("contentSystemAutoHideTime", autoHideTime.toString());
  localStorage.setItem("contentSystemNextImageId", nextImageId.toString());
}

// 初始化页面
function initPage() {
  if (!navItemsContainer || !contentContainer || !emptyState) {
    console.error("必要的DOM元素未找到，等待页面加载");
    setTimeout(initPage, 100);
    return;
  }

  contentItems.sort((a, b) => a.order - b.order);

  renderNavItems();
  renderContent();

  if (contentItems.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  setBackground(
    currentBackground.type,
    currentBackground.src,
    currentBackground.isLocalFile,
  );
  setOpacity(backgroundOpacity, overlayOpacity);
  setTheme(isLightMode);
  saveToLocalStorage();
}

// 设置主题
function setTheme(isLight) {
  isLightMode = isLight;
  if (isLightMode) {
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.remove("light-mode");
  }
  saveToLocalStorage();
}

function toggleTheme() {
  setTheme(!isLightMode);
}

// 设置透明度
function setOpacity(bgOpacity, olOpacity) {
  backgroundOpacity = bgOpacity;
  overlayOpacity = olOpacity;

  if (backgroundMedia && backgroundMedia.style.display !== "none") {
    backgroundMedia.style.opacity = (backgroundOpacity / 100).toFixed(2);
  }

  if (backgroundVideo && backgroundVideo.style.display !== "none") {
    backgroundVideo.style.opacity = (backgroundOpacity / 100).toFixed(2);
  }

  if (backgroundOverlay) {
    if (isLightMode) {
      backgroundOverlay.style.background = `rgba(255, 255, 255, ${overlayOpacity / 100})`;
    } else {
      backgroundOverlay.style.background = `rgba(15, 15, 30, ${overlayOpacity / 100})`;
    }
  }

  if (opacitySlider) {
    opacitySlider.value = backgroundOpacity;
  }

  if (opacityValue) {
    opacityValue.textContent = `${backgroundOpacity}%`;
  }

  saveToLocalStorage();
}

// 渲染导航项
function renderNavItems() {
  navItemsContainer.innerHTML = "";

  const mainTitleItems = contentItems.filter(
    (item) => item.type === "main-title",
  );

  mainTitleItems.forEach((item) => {
    const navItem = document.createElement("div");
    navItem.className = "nav-item";
    navItem.dataset.id = item.id;
    navItem.title = item.text;

    navItem.innerHTML = `
            <div class="nav-item-title">${getPreviewText(item.text, 10)}</div>
        `;

    navItem.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.remove("active");
      });
      navItem.classList.add("active");
      scrollToItem(item.id);
    });

    navItemsContainer.appendChild(navItem);
  });
}

// 获取预览文本
function getPreviewText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// 渲染内容区域
function renderContent() {
  contentContainer.innerHTML = "";

  if (contentItems.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  contentItems.forEach((item) => {
    if (item.type === "main-title") {
      renderMainTitle(item);
    } else if (item.type === "subtitle") {
      renderSubtitle(item);
    } else if (item.type === "content-card") {
      renderContentCard(item);
    } else if (item.type === "image-card") {
      renderImageCard(item);
    }
  });

  emptyState.style.display = "none";
}

function renderMainTitle(item) {
  const mainTitle = document.createElement("div");
  mainTitle.className = "main-title";
  mainTitle.id = `item-${item.id}`;
  mainTitle.dataset.id = item.id;
  mainTitle.dataset.type = item.type;
  mainTitle.textContent = item.text;

  mainTitle.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    contextMenuTarget = { type: "main-title", id: item.id };
    showContextMenu(e);
  });

  contentContainer.appendChild(mainTitle);
}

function renderSubtitle(item) {
  const subtitle = document.createElement("div");
  subtitle.className = "subtitle";
  subtitle.id = `item-${item.id}`;
  subtitle.dataset.id = item.id;
  subtitle.dataset.type = item.type;
  subtitle.textContent = item.text;

  subtitle.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    contextMenuTarget = { type: "subtitle", id: item.id };
    showContextMenu(e);
  });

  contentContainer.appendChild(subtitle);
}

function renderContentCard(item) {
  const contentCard = document.createElement("div");
  contentCard.className = "content-card";
  contentCard.id = `card-${item.id}`;
  contentCard.dataset.id = item.id;
  contentCard.dataset.type = "content-card";

  contentCard.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    contextMenuTarget = { type: "content-card", id: item.id };
    showContextMenu(e);
  });

  if (item.content && item.content.length > 0) {
    item.content.forEach((contentItem) => {
      const contentItemElement = document.createElement("div");
      contentItemElement.className = "content-item";
      contentItemElement.id = `content-item-${contentItem.id}`;
      contentItemElement.dataset.id = contentItem.id;
      contentItemElement.dataset.cardId = item.id;
      contentItemElement.dataset.type = "content-item";
      contentItemElement.innerHTML = contentItem.text.replace(/\n/g, "<br>");

      contentItemElement.addEventListener("click", () => {
        navigator.clipboard.writeText(contentItem.text).then(() => {
          showCopyNotification();
          if (currentHighlightedItem) {
            currentHighlightedItem.classList.remove("highlighted");
          }
          contentItemElement.classList.add("highlighted");
          currentHighlightedItem = contentItemElement;
        });
      });

      contentItemElement.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        contextMenuTarget = {
          type: "content-item",
          id: contentItem.id,
          cardId: item.id,
        };
        showContextMenu(e);
      });

      contentCard.appendChild(contentItemElement);
    });
  }

  contentContainer.appendChild(contentCard);
}

// 显示右键菜单
// 显示右键菜单 - 完全修复版，确保菜单在可视区域内
function showContextMenu(e) {
  // 防止默认右键菜单
  e.preventDefault();

  // 先隐藏菜单，以便计算正确尺寸
  contextMenu.classList.remove("active");

  // 强制浏览器重新计算布局
  contextMenu.style.display = "block";

  // 设置菜单项显示状态
  if (contextMenuTarget) {
    editContextItem.style.display = "flex";
    addContextItem.style.display = "flex";
    deleteContextItem.style.display = "flex";

    if (
      contextMenuTarget.type === "content-card" ||
      contextMenuTarget.type === "main-title" ||
      contextMenuTarget.type === "subtitle" ||
      contextMenuTarget.type === "image-card"
    ) {
      insertAfterContextItem.style.display = "flex";
      insertMainTitleAfterItem.style.display = "flex";
      insertSubtitleAfterItem.style.display = "flex";
      insertImagesAfterItem.style.display = "flex";
      // 新增：编辑图片选项只在图片卡片上显示
      const editImagesItem = document.getElementById("editImagesItem");
      if (editImagesItem) {
        editImagesItem.style.display =
          contextMenuTarget.type === "image-card" ? "flex" : "none";
      }
    } else {
      insertAfterContextItem.style.display = "none";
      insertMainTitleAfterItem.style.display = "none";
      insertSubtitleAfterItem.style.display = "none";
      insertImagesAfterItem.style.display = "none";
      // 隐藏编辑图片选项
      const editImagesItem = document.getElementById("editImagesItem");
      if (editImagesItem) {
        editImagesItem.style.display = "none";
      }
    }
  }

  // 等待下一帧确保DOM更新
  setTimeout(() => {
    // 获取菜单的实际尺寸（包括边框、阴影等）
    const menuRect = contextMenu.getBoundingClientRect();
    const menuWidth = menuRect.width;
    const menuHeight = menuRect.height;

    // 获取窗口尺寸（考虑滚动条）
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;

    // 点击位置
    const clickX = e.clientX;
    const clickY = e.clientY;

    // 计算初始位置（通常希望在点击点右下方显示）
    let left = clickX;
    let top = clickY;

    // 安全边距
    const margin = 5;

    // ===== 水平方向调整 =====
    // 检查右侧空间
    if (left + menuWidth + margin > windowWidth) {
      // 右侧空间不足，尝试显示在左侧
      left = clickX - menuWidth - margin;

      // 如果左侧也不够，则紧贴右边界
      if (left < margin) {
        left = windowWidth - menuWidth - margin;
      }
    } else if (left < margin) {
      // 左侧空间不足，紧贴左边界
      left = margin;
    }

    // ===== 垂直方向调整 =====
    // 计算上下可用空间
    const spaceBelow = windowHeight - clickY - margin;
    const spaceAbove = clickY - margin;

    if (spaceBelow >= menuHeight) {
      // 下方空间足够，在下方显示
      top = clickY + margin;
    } else if (spaceAbove >= menuHeight) {
      // 上方空间足够，在上方显示
      top = clickY - menuHeight - margin;
    } else {
      // 上下空间都不够，选择空间较大的一侧
      if (spaceBelow >= spaceAbove) {
        // 下方空间相对较大
        top = windowHeight - menuHeight - margin;
      } else {
        // 上方空间相对较大
        top = margin;
      }
    }

    // 最终边界检查
    left = Math.max(margin, Math.min(left, windowWidth - menuWidth - margin));
    top = Math.max(margin, Math.min(top, windowHeight - menuHeight - margin));

    // 设置位置
    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;

    // 显示菜单
    contextMenu.style.display = "";
    contextMenu.classList.add("active");

    console.log(
      `菜单位置: left=${left}, top=${top}, 尺寸: ${menuWidth}x${menuHeight}, 窗口: ${windowWidth}x${windowHeight}`,
    );
  }, 10);
}

// 滚动到指定内容项
function scrollToItem(itemId) {
  const itemElement = document.getElementById(`item-${itemId}`);
  if (itemElement) {
    itemElement.scrollIntoView({ behavior: "auto", block: "start" });

    const originalBackground = itemElement.style.background;
    if (isLightMode) {
      itemElement.style.background = "rgba(255, 64, 129, 0.3)";
    } else {
      itemElement.style.background = "rgba(255, 0, 204, 0.3)";
    }

    setTimeout(() => {
      itemElement.style.background = originalBackground;
    }, 1500);
  }
}

// 显示复制成功通知
function showCopyNotification(message = "复制成功！", type = "content-copied") {
  const notification = document.getElementById("copyNotification");
  const messageSpan = notification.querySelector("span");
  const icon = notification.querySelector("i");

  // 设置消息
  messageSpan.textContent = message;

  // 设置图标
  if (type === "image-copied") {
    icon.className = "fas fa-image";
  } else if (type === "image-deleted") {
    icon.className = "fas fa-trash-alt";
  } else if (type === "data-exported") {
    icon.className = "fas fa-file-export";
  } else {
    icon.className = "fas fa-check-circle";
  }

  // 设置样式类
  notification.className = "copy-notification show";
  notification.classList.add(type);

  // 显示通知
  notification.classList.add("show");

  // 3秒后隐藏
  setTimeout(() => {
    notification.classList.remove("show");
    // 延迟移除类型类，确保动画完成
    setTimeout(() => {
      notification.className = "copy-notification";
    }, 300);
  }, 3000);
}

// 打开新增模态框
function openAddModal(type) {
  currentItemType = type;
  currentEditItemId = null;
  currentEditCardItemId = null;
  currentContentCardId = null;
  currentInsertAfterId = null;

  textareaContainer.innerHTML = `
        <div class="form-group textarea-group">
            <label class="form-label" id="formLabel">内容</label>
            <textarea class="form-input content-textarea" rows="4" placeholder="请输入内容，换行将保留格式"></textarea>
        </div>
    `;

  let title = "";
  switch (type) {
    case "main-title":
      title = "新增大标题";
      formLabel.textContent = "大标题内容（将居中显示，并在左侧生成导航按钮）";
      break;
    case "subtitle":
      title = "新增小标题";
      formLabel.textContent = "小标题内容";
      break;
    case "content-card":
      title = "新增内容卡片";
      formLabel.textContent = "内容（支持多行文本，单击可复制）";
      break;
  }

  modalTitle.textContent = title;
  submitBtn.innerHTML = '<i class="fas fa-save"></i> 保存';
  modalOverlay.classList.add("active");

  setTimeout(() => {
    const firstTextarea = document.querySelector(".content-textarea");
    if (firstTextarea) firstTextarea.focus();
  }, 100);
}

// 打开编辑模态框
function openEditModal() {
  if (!contextMenuTarget) return;

  const { type, id, cardId } = contextMenuTarget;
  textareaContainer.innerHTML = "";

  if (type === "content-item") {
    const cardIndex = contentItems.findIndex((item) => item.id === cardId);
    if (cardIndex !== -1) {
      const contentItem = contentItems[cardIndex].content.find(
        (item) => item.id === id,
      );
      if (contentItem) {
        const textareaGroup = document.createElement("div");
        textareaGroup.className = "form-group textarea-group";
        textareaGroup.innerHTML = `
                    <label class="form-label">内容</label>
                    <textarea class="form-input content-textarea" rows="4">${contentItem.text}</textarea>
                `;
        textareaContainer.appendChild(textareaGroup);
      }
    }
    modalTitle.textContent = "编辑内容";
    currentItemType = "content-item";
    currentEditCardItemId = id;
    currentContentCardId = cardId;
    currentEditItemId = null;
  } else {
    const itemIndex = contentItems.findIndex((item) => item.id === id);
    if (itemIndex !== -1) {
      const item = contentItems[itemIndex];

      if (type === "content-card") {
        modalTitle.textContent = "编辑内容卡片";
        currentItemType = "content-card";

        if (item.content && item.content.length > 0) {
          item.content.forEach((contentItem, index) => {
            const textareaGroup = document.createElement("div");
            textareaGroup.className = "form-group textarea-group";
            textareaGroup.innerHTML = `
                            <label class="form-label">内容 ${index + 1}</label>
                            <textarea class="form-input content-textarea" rows="4">${contentItem.text}</textarea>
                        `;
            textareaContainer.appendChild(textareaGroup);
          });
        } else {
          const textareaGroup = document.createElement("div");
          textareaGroup.className = "form-group textarea-group";
          textareaGroup.innerHTML = `
                        <label class="form-label">内容</label>
                        <textarea class="form-input content-textarea" rows="4" placeholder="请输入内容，换行将保留格式"></textarea>
                    `;
          textareaContainer.appendChild(textareaGroup);
        }
      } else {
        const textareaGroup = document.createElement("div");
        textareaGroup.className = "form-group textarea-group";

        if (type === "main-title") {
          modalTitle.textContent = "编辑大标题";
          textareaGroup.innerHTML = `
                        <label class="form-label">大标题内容</label>
                        <textarea class="form-input content-textarea" rows="4">${item.text}</textarea>
                    `;
        } else if (type === "subtitle") {
          modalTitle.textContent = "编辑小标题";
          textareaGroup.innerHTML = `
                        <label class="form-label">小标题内容</label>
                        <textarea class="form-input content-textarea" rows="4">${item.text}</textarea>
                    `;
        }

        textareaContainer.appendChild(textareaGroup);
        currentItemType = type;
      }

      currentEditItemId = id;
      currentEditCardItemId = null;
      currentContentCardId = null;
    }
  }

  submitBtn.innerHTML = '<i class="fas fa-save"></i> 更新';
  modalOverlay.classList.add("active");

  setTimeout(() => {
    const firstTextarea = document.querySelector(".content-textarea");
    if (firstTextarea) firstTextarea.focus();
  }, 100);
}

// 新增函数：打开插入卡片模态框
function openInsertAfterModal() {
  if (!contextMenuTarget) return;

  const { type, id } = contextMenuTarget;
  currentItemType = "content-card";
  currentInsertAfterId = id;

  textareaContainer.innerHTML = `
        <div class="form-group textarea-group">
            <label class="form-label">卡片内容（支持多行文本，单击可复制）</label>
            <textarea class="form-input content-textarea" rows="4" placeholder="请输入卡片内容，换行将保留格式"></textarea>
        </div>
    `;

  modalTitle.textContent = "插入内容卡片";
  formLabel.textContent = "卡片内容（支持多行文本，单击可复制）";
  submitBtn.innerHTML = '<i class="fas fa-save"></i> 插入卡片';
  modalOverlay.classList.add("active");

  setTimeout(() => {
    const firstTextarea = document.querySelector(".content-textarea");
    if (firstTextarea) firstTextarea.focus();
  }, 100);
}

// 新增函数：打开插入大标题模态框
function openInsertMainTitleAfterModal() {
  if (!contextMenuTarget) return;

  const { type, id } = contextMenuTarget;
  currentItemType = "main-title";
  currentInsertAfterId = id;

  textareaContainer.innerHTML = `
        <div class="form-group textarea-group">
            <label class="form-label">大标题内容</label>
            <textarea class="form-input content-textarea" rows="4" placeholder="请输入大标题内容"></textarea>
        </div>
    `;

  modalTitle.textContent = "插入大标题";
  formLabel.textContent = "大标题内容";
  submitBtn.innerHTML = '<i class="fas fa-save"></i> 插入大标题';
  modalOverlay.classList.add("active");

  setTimeout(() => {
    const firstTextarea = document.querySelector(".content-textarea");
    if (firstTextarea) firstTextarea.focus();
  }, 100);
}

// 新增函数：打开插入小标题模态框
function openInsertSubtitleAfterModal() {
  if (!contextMenuTarget) return;

  const { type, id } = contextMenuTarget;
  currentItemType = "subtitle";
  currentInsertAfterId = id;

  textareaContainer.innerHTML = `
        <div class="form-group textarea-group">
            <label class="form-label">小标题内容</label>
            <textarea class="form-input content-textarea" rows="4" placeholder="请输入小标题内容"></textarea>
        </div>
    `;

  modalTitle.textContent = "插入小标题";
  formLabel.textContent = "小标题内容";
  submitBtn.innerHTML = '<i class="fas fa-save"></i> 插入小标题';
  modalOverlay.classList.add("active");

  setTimeout(() => {
    const firstTextarea = document.querySelector(".content-textarea");
    if (firstTextarea) firstTextarea.focus();
  }, 100);
}

// 新增文本区域
function addNewTextarea() {
  const textareaGroup = document.createElement("div");
  textareaGroup.className = "form-group textarea-group";
  textareaGroup.innerHTML = `
        <label class="form-label">内容 ${textareaContainer.children.length + 1}</label>
        <textarea class="form-input content-textarea" rows="4" placeholder="请输入内容，换行将保留格式"></textarea>
    `;
  textareaContainer.appendChild(textareaGroup);
}

// 在指定项目后面插入新卡片
function insertContentAfter(targetId, newItem) {
  const targetIndex = contentItems.findIndex((item) => item.id === targetId);

  if (targetIndex !== -1) {
    contentItems.splice(targetIndex + 1, 0, newItem);
    contentItems.forEach((item, index) => {
      item.order = index + 1;
    });
  } else {
    contentItems.push(newItem);
  }
}

// 保存内容项
// 修改后的保存内容项函数 - 完整版
async function saveContentItem(e) {
  e.preventDefault();

  const textareas = document.querySelectorAll(".content-textarea");
  const contents = Array.from(textareas)
    .map((ta) => ta.value.trim())
    .filter((text) => text !== "");

  // 1. 替换原有的系统 alert
  if (contents.length === 0) {
    await Modal.alert("请至少输入一个内容区域，不能为空！", "输入提示");
    return;
  }

  const isInsertOperation =
    currentInsertAfterId &&
    (submitBtn.innerHTML.includes("插入卡片") ||
      submitBtn.innerHTML.includes("插入大标题") ||
      submitBtn.innerHTML.includes("插入小标题"));

  if (currentItemType === "content-item" && currentEditCardItemId) {
    // 情况 A: 编辑卡片内部的某一项
    const cardIndex = contentItems.findIndex(
      (item) => item.id === currentContentCardId,
    );

    if (cardIndex !== -1) {
      const contentItemIndex = contentItems[cardIndex].content.findIndex(
        (item) => item.id === currentEditCardItemId,
      );

      if (contentItemIndex !== -1) {
        contentItems[cardIndex].content[contentItemIndex].text = contents[0];
      }
    }
  } else if (currentEditItemId) {
    // 情况 B: 编辑整个卡片或标题
    const itemIndex = contentItems.findIndex(
      (item) => item.id === currentEditItemId,
    );

    if (itemIndex !== -1) {
      if (currentItemType === "content-card") {
        contentItems[itemIndex].content = contents.map((text, index) => ({
          id: contentItems[itemIndex].content[index]?.id || nextContentItemId++,
          type: "content",
          text,
        }));
      } else {
        contentItems[itemIndex].text = contents[0];
      }
    }
  } else if (isInsertOperation) {
    // 情况 C: 插入操作（右键菜单触发）
    let newItem;

    if (currentItemType === "content-card") {
      newItem = {
        id: nextItemId++,
        type: "content-card",
        content: contents.map((text) => ({
          id: nextContentItemId++,
          type: "content",
          text,
        })),
        order: 0,
        parentId: null,
      };
    } else if (currentItemType === "main-title") {
      newItem = {
        id: nextItemId++,
        type: "main-title",
        text: contents[0],
        order: 0,
        parentId: null,
      };
    } else if (currentItemType === "subtitle") {
      newItem = {
        id: nextItemId++,
        type: "subtitle",
        text: contents[0],
        order: 0,
        parentId: null,
      };
    }

    insertContentAfter(currentInsertAfterId, newItem);
    currentInsertAfterId = null;
  } else {
    // 情况 D: 普通新增操作（页面底部按钮触发）
    let newItem;

    if (currentItemType === "content-card") {
      newItem = {
        id: nextItemId++,
        type: "content-card",
        content: contents.map((text) => ({
          id: nextContentItemId++,
          type: "content",
          text,
        })),
        order: contentItems.length + 1,
        parentId: null,
      };
    } else {
      newItem = {
        id: nextItemId++,
        type: currentItemType,
        text: contents[0],
        order: contentItems.length + 1,
        parentId: null,
      };
    }

    contentItems.push(newItem);
  }

  // 重置表单并保存数据
  contentForm.reset();
  modalOverlay.classList.remove("active");
  initPage();
  saveToLocalStorage(); // 确保保存到本地存储

  // 如果是插入操作，执行滚动定位和高亮效果
  if (isInsertOperation) {
    setTimeout(() => {
      const newItemId = nextItemId - 1;
      const newItemElement =
        currentItemType === "content-card"
          ? document.getElementById(`card-${newItemId}`)
          : document.getElementById(`item-${newItemId}`);

      if (!newItemElement) return;

      newItemElement.scrollIntoView({ behavior: "smooth", block: "start" });

      const originalBg = newItemElement.style.background;

      // 根据模式和类型设置高亮颜色
      if (isLightMode) {
        if (currentItemType === "main-title") {
          newItemElement.style.background = "rgba(255, 64, 129, 0.3)";
        } else if (currentItemType === "subtitle") {
          newItemElement.style.background = "rgba(41, 121, 255, 0.3)";
        } else {
          newItemElement.style.background = "rgba(0, 200, 83, 0.3)";
        }
      } else {
        if (currentItemType === "main-title") {
          newItemElement.style.background = "rgba(255, 0, 204, 0.3)";
        } else if (currentItemType === "subtitle") {
          newItemElement.style.background = "rgba(51, 102, 255, 0.3)";
        } else {
          newItemElement.style.background = "rgba(0, 204, 102, 0.3)";
        }
      }

      // 1.5秒后恢复原始背景
      setTimeout(() => {
        newItemElement.style.background = originalBg;
      }, 1500);

      // 如果是大标题，刷新导航栏
      if (currentItemType === "main-title") {
        if (typeof renderNavItems === "function") {
          renderNavItems();
          setTimeout(() => {
            document.querySelectorAll(".nav-item").forEach((item) => {
              item.classList.remove("active");
              if (parseInt(item.dataset.id) === newItemId) {
                item.classList.add("active");
              }
            });
          }, 100);
        }
      }
    }, 300);
  }
}

// 删除内容项
async function deleteContentItem() {
  if (!contextMenuTarget) return;

  // 1. 在 await 之前，先解构保存需要的数据
  // 因为 Modal 弹窗是异步的，如果中途 contextMenuTarget 被其他操作清空，逻辑会失效
  const { type, id, cardId } = contextMenuTarget;

  // 2. 调用自定义确认弹窗
  const isConfirmed = await Modal.confirm(
    "确定要删除这个内容吗？删除后无法恢复。",
    "确认删除",
  );

  if (!isConfirmed) return;

  // 3. 执行删除逻辑
  if (type === "content-item") {
    // 情况 A: 删除卡片内部的某一项
    const cardIndex = contentItems.findIndex((item) => item.id === cardId);
    if (cardIndex !== -1) {
      contentItems[cardIndex].content = contentItems[cardIndex].content.filter(
        (item) => item.id !== id,
      );
    }
  } else {
    // 情况 B: 删除整个卡片 (标题卡、图片卡等)
    contentItems = contentItems.filter((item) => item.id !== id);

    // 重新排序
    contentItems.forEach((item, index) => {
      item.order = index + 1;
    });
  }

  // 4. 更新界面并保存
  initPage();
  saveToLocalStorage(); // 记得调用保存，确保刷新后删除依然生效

  // 5. 显示删除成功通知
  if (typeof showCopyNotification === "function") {
    showCopyNotification();
    const notifySpan = document.querySelector("#copyNotification span");
    if (notifySpan) notifySpan.textContent = "内容已删除";
  }
}

// 设置背景
function setBackground(type, src, isLocalFile = false) {
  if (!backgroundMedia || !backgroundVideo) {
    console.error("背景媒体元素未找到");
    return;
  }

  backgroundMedia.style.display = "none";
  backgroundVideo.style.display = "none";
  backgroundVideo.pause();

  if (type === "none") {
    currentBackground = { type: "none", src: "", isLocalFile: false };
    if (isLightMode) {
      document.body.style.background =
        "linear-gradient(135deg, #e3f2fd, #bbdefb, #90caf9)";
    } else {
      document.body.style.background =
        "linear-gradient(135deg, #0f0c29, #302b63, #24243e)";
    }
  } else if (type === "image") {
    currentBackground = {
      type: "image",
      src: src,
      isLocalFile: isLocalFile,
    };

    backgroundMedia.onload = function () {
      if (backgroundMedia) {
        backgroundMedia.style.display = "block";
        backgroundMedia.style.opacity = (backgroundOpacity / 100).toFixed(2);
        backgroundMedia.style.objectFit = "cover";
        backgroundMedia.style.objectPosition = "center";
      }
    };
    backgroundMedia.onerror = function () {
      console.error("背景图片加载失败:", src);
    };

    backgroundMedia.src = src;
    backgroundMedia.style.objectFit = "cover";
    backgroundMedia.style.objectPosition = "center";
  } else if (type === "video") {
    currentBackground = {
      type: "video",
      src: src,
      isLocalFile: isLocalFile,
    };

    backgroundVideo.onloadeddata = function () {
      if (backgroundVideo) {
        backgroundVideo.style.display = "block";
        backgroundVideo.style.opacity = (backgroundOpacity / 100).toFixed(2);
        backgroundVideo.style.objectFit = "cover";
        backgroundVideo.style.objectPosition = "center";
        backgroundVideo
          .play()
          .catch((e) => console.log("视频自动播放被阻止:", e));
      }
    };
    backgroundVideo.onerror = function () {
      console.error("背景视频加载失败:", src);
    };

    backgroundVideo.src = src;
    backgroundVideo.style.objectFit = "cover";
    backgroundVideo.style.objectPosition = "center";
    backgroundVideo.load();
  }

  saveToLocalStorage();
}

// 预览上传的文件
// 修改后的文件预览函数 - 支持视频/图片预览及自定义错误弹窗
async function previewUploadedFile(file) {
  const previewArea = uploadPreview;

  // 1. 初始化预览区域
  previewArea.innerHTML = "";

  if (!file) {
    previewArea.innerHTML = "<p>预览区域</p>";
    return;
  }

  const fileType = file.type;
  const isImage = fileType.startsWith("image/");
  const isVideo = fileType.startsWith("video/");

  // 2. 替代原来的 innerHTML 提示，改用自定义弹窗
  if (!isImage && !isVideo) {
    previewArea.innerHTML = "<p style='color: #ff6b35;'>不支持的文件格式</p>";
    // 使用 await 确保用户看到并点击确认后，程序再继续或结束
    await Modal.alert(
      "当前仅支持图片（JPG, PNG, WebP）或视频（MP4）格式的文件。",
      "格式不支持",
    );
    return;
  }

  // 3. 处理文件读取
  const reader = new FileReader();

  // 显示加载中状态
  previewArea.innerHTML =
    "<div class='loading-spinner'><i class='fas fa-spinner fa-spin'></i> 读取中...</div>";

  reader.onload = function (e) {
    previewArea.innerHTML = ""; // 清除加载状态

    if (isImage) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "300px"; // 限制预览高度
      img.style.borderRadius = "8px";
      img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
      previewArea.appendChild(img);
    } else if (isVideo) {
      const video = document.createElement("video");
      video.src = e.target.result;
      video.controls = true;
      video.muted = true;
      video.autoplay = true; // 预览时自动播放
      video.style.maxWidth = "100%";
      video.style.maxHeight = "300px";
      video.style.borderRadius = "8px";
      previewArea.appendChild(video);
    }
  };

  reader.onerror = async function () {
    previewArea.innerHTML = "<p>文件读取失败</p>";
    await Modal.alert(
      "无法读取该文件，请检查文件是否损坏或被占用。",
      "读取错误",
    );
  };

  reader.readAsDataURL(file);
}

// 预览自定义链接
function previewCustomLink(url) {
  const previewArea = customPreview;
  previewArea.innerHTML = "";

  if (!url) {
    previewArea.innerHTML = "<p>预览区域</p>";
    return;
  }

  if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
    const img = document.createElement("img");
    img.src = url;
    img.onerror = function () {
      previewArea.innerHTML = "<p>图片加载失败</p>";
    };
    previewArea.appendChild(img);
  } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.muted = true;
    video.onerror = function () {
      previewArea.innerHTML = "<p>视频加载失败</p>";
    };
    previewArea.appendChild(video);
  } else {
    previewArea.innerHTML = "<p>无法识别链接类型</p>";
  }
}

// 初始化背景选择功能
// 修改后的背景选择器初始化函数 - 完整版
function initBackgroundSelector() {
  backgroundSelectorBtn.addEventListener("click", () => {
    document.querySelectorAll(".background-option").forEach((option) => {
      option.classList.remove("selected");
    });

    switchTab("background", "preset");

    const currentOption = document.querySelector(
      `.background-option[data-type="${currentBackground.type}"]`,
    );
    if (currentOption && currentBackground.type !== "none") {
      currentOption.classList.add("selected");
    } else {
      const noneOption = document.querySelector(
        '.background-option[data-type="none"]',
      );
      if (noneOption) noneOption.classList.add("selected");
    }

    customBackgroundInput.value = "";
    customPreview.innerHTML = "<p>预览区域</p>";
    uploadPreview.innerHTML = "<p>预览区域</p>";
    backgroundModal.classList.add("active");
  });

  backgroundTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab;
      switchTab("background", tabId);
    });
  });

  document.querySelectorAll(".background-option").forEach((option) => {
    option.addEventListener("click", () => {
      document.querySelectorAll(".background-option").forEach((opt) => {
        opt.classList.remove("selected");
      });
      option.classList.add("selected");
    });
  });

  fileUploadArea.addEventListener("click", () => {
    backgroundFileInput.click();
  });

  // 文件拖放功能
  fileUploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = "#ff9900";
    fileUploadArea.style.background = "rgba(255, 153, 0, 0.1)";
  });

  fileUploadArea.addEventListener("dragleave", () => {
    fileUploadArea.style.borderColor = "rgba(255, 255, 255, 0.1)";
    fileUploadArea.style.background = "rgba(255, 153, 0, 0.05)";
  });

  // 改为 async 处理拖放
  fileUploadArea.addEventListener("drop", async (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = "rgba(255, 255, 255, 0.1)";
    fileUploadArea.style.background = "rgba(255, 153, 0, 0.05)";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        // 使用 DataTransfer 确保 input.files 被正确填充
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        backgroundFileInput.files = dataTransfer.files;
        previewUploadedFile(file);
      } else {
        await Modal.alert("请选择图片或视频文件作为背景。", "格式不支持");
      }
    }
  });

  backgroundFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      previewUploadedFile(file);
    }
  });

  customBackgroundInput.addEventListener("input", () => {
    const url = customBackgroundInput.value.trim();
    if (url) {
      previewCustomLink(url);
    } else {
      customPreview.innerHTML = "<p>预览区域</p>";
    }
  });

  // 改为 async 处理背景应用逻辑
  applyBackgroundBtn.addEventListener("click", async () => {
    const activeTabEl = document.querySelector(".background-tab.active");
    if (!activeTabEl) return;
    const activeTab = activeTabEl.dataset.tab;

    if (activeTab === "preset") {
      const selectedOption = document.querySelector(
        ".background-option.selected",
      );
      if (selectedOption) {
        const type = selectedOption.dataset.type;
        const src = selectedOption.dataset.src || "";
        setBackground(type, src, false);
        backgroundModal.classList.remove("active");
      }
    } else if (activeTab === "upload") {
      const file = backgroundFileInput.files[0];
      if (!file) {
        await Modal.alert("请先上传一个图片或视频文件。", "未选择文件");
        return;
      }

      const fileType = file.type;
      const isImage = fileType.startsWith("image/");
      const isVideo = fileType.startsWith("video/");

      if (!isImage && !isVideo) {
        await Modal.alert("不支持的文件格式，请选择图片或视频。", "格式错误");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const type = isImage ? "image" : "video";
        setBackground(type, e.target.result, true);
        backgroundModal.classList.remove("active");
      };
      reader.readAsDataURL(file);
    } else if (activeTab === "custom") {
      const url = customBackgroundInput.value.trim();
      if (!url) {
        await Modal.alert("请输入有效的图片或视频链接地址。", "输入为空");
        return;
      }

      if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|mp4|webm|ogg)$/i)) {
        const type = url.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image";
        setBackground(type, url, false);
        backgroundModal.classList.remove("active");
      } else {
        await Modal.alert(
          "请输入有效的链接，支持常见格式：\njpg, png, gif, webp, mp4, webm",
          "链接无效",
        );
      }
    }
  });

  cancelBackgroundBtn.addEventListener("click", () => {
    backgroundModal.classList.remove("active");
  });

  closeBackgroundModal.addEventListener("click", () => {
    backgroundModal.classList.remove("active");
  });

  backgroundModal.addEventListener("click", (e) => {
    if (e.target === backgroundModal) {
      backgroundModal.classList.remove("active");
    }
  });
}

// 初始化透明度控制功能
function initOpacityControl() {
  opacityControlBtn.addEventListener("click", () => {
    opacitySlider.value = backgroundOpacity;
    opacityValue.textContent = `${backgroundOpacity}%`;
    opacityModal.classList.add("active");
  });

  opacitySlider.addEventListener("input", function () {
    const value = this.value;
    opacityValue.textContent = `${value}%`;
  });

  opacityPresetBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const value = this.getAttribute("data-value");
      opacitySlider.value = value;
      opacityValue.textContent = `${value}%`;
    });
  });

  applyOpacityBtn.addEventListener("click", () => {
    const newOpacity = parseInt(opacitySlider.value);
    setOpacity(newOpacity, newOpacity);
    saveAutoHideSettings();
    opacityModal.classList.remove("active");
  });

  cancelOpacityBtn.addEventListener("click", () => {
    opacityModal.classList.remove("active");
  });

  closeOpacityModal.addEventListener("click", () => {
    opacityModal.classList.remove("active");
  });

  opacityModal.addEventListener("click", (e) => {
    if (e.target === opacityModal) {
      opacityModal.classList.remove("active");
    }
  });
}

// 切换标签页
function switchTab(modalType, tabId) {
  if (modalType === "background") {
    document.querySelectorAll(".background-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    document.querySelectorAll(".background-tab-content").forEach((content) => {
      content.classList.remove("active");
    });

    document
      .querySelector(`.background-tab[data-tab="${tabId}"]`)
      .classList.add("active");
    document.getElementById(`${tabId}-tab`).classList.add("active");
  } else if (modalType === "import-export") {
    document.querySelectorAll(".import-export-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    document
      .querySelectorAll(".import-export-tab-content")
      .forEach((content) => {
        content.classList.remove("active");
      });

    document
      .querySelector(`.import-export-tab[data-tab="${tabId}"]`)
      .classList.add("active");
    document.getElementById(`${tabId}-tab`).classList.add("active");

    currentImportExportTab = tabId;

    if (tabId === "export") {
      exportActionBtn.textContent = "导出数据";
      exportActionBtn.style.display = "block";
      importActionBtn.style.display = "none";
    } else {
      exportActionBtn.style.display = "none";
      importActionBtn.textContent = "导入数据";
      importActionBtn.style.display = "block";
    }
  }
}

// 初始化导入导出功能
// 修改后的导入导出初始化函数 - 完整版
function initImportExport() {
  exportBtn.addEventListener("click", () => {
    switchTab("import-export", "export");
    updateExportPreview();
    importExportModal.classList.add("active");
  });

  importBtn.addEventListener("click", () => {
    switchTab("import-export", "import");
    importPreview.innerHTML = "<p>导入文件预览区域</p>";
    importExportModal.classList.add("active");
  });

  importExportTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab;
      switchTab("import-export", tabId);
    });
  });

  exportActionBtn.addEventListener("click", exportData);
  importActionBtn.addEventListener("click", importData);

  cancelImportExportBtn.addEventListener("click", () => {
    importExportModal.classList.remove("active");
  });

  closeImportExportModal.addEventListener("click", () => {
    importExportModal.classList.remove("active");
  });

  importFileArea.addEventListener("click", () => {
    importFileInput.click();
  });

  // 文件拖放功能
  importFileArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    importFileArea.style.borderColor = "#ff3366";
    importFileArea.style.background = "rgba(255, 51, 102, 0.1)";
  });

  importFileArea.addEventListener("dragleave", () => {
    importFileArea.style.borderColor = "rgba(255, 255, 255, 0.1)";
    importFileArea.style.background = "rgba(255, 51, 102, 0.05)";
  });

  // 改为 async 以支持自定义弹窗
  importFileArea.addEventListener("drop", async (e) => {
    e.preventDefault();
    importFileArea.style.borderColor = "rgba(255, 255, 255, 0.1)";
    importFileArea.style.background = "rgba(255, 51, 102, 0.05)";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const fileName = file.name.toLowerCase();

      // 检查是否为支持的文件格式
      if (
        fileName.endsWith(".json") ||
        fileName.endsWith(".txt") ||
        fileName.endsWith(".text") ||
        fileName.endsWith(".csv")
      ) {
        // 使用 DataTransfer 规范化赋值
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        importFileInput.files = dataTransfer.files;

        previewImportFile(file);
      } else {
        await Modal.alert(
          "请选择有效的 JSON、TXT 或 CSV 格式文件进行导入。",
          "不支持的文件格式",
        );
      }
    }
  });

  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      previewImportFile(file);
    }
  });

  importExportModal.addEventListener("click", (e) => {
    if (e.target === importExportModal) {
      importExportModal.classList.remove("active");
    }
  });
}
// 更新导出数据预览
function updateExportPreview() {
  const exportFormat = document.querySelector(
    'input[name="exportFormat"]:checked',
  ).value;

  if (exportFormat === "json") {
    const data = {
      contentItems: contentItems,
      nextItemId: nextItemId,
      nextContentItemId: nextContentItemId,
      currentBackground: currentBackground,
      backgroundOpacity: backgroundOpacity,
      overlayOpacity: overlayOpacity,
      isLightMode: isLightMode,
      exportTime: new Date().toISOString(),
      version: "1.0",
    };

    exportDataPreview.textContent = JSON.stringify(data, null, 2);
  } else if (exportFormat === "txt") {
    let text = "";
    contentItems.forEach((item) => {
      if (item.type === "main-title") {
        text += `### ${item.text}\n\n`;
      } else if (item.type === "subtitle") {
        text += `#### ${item.text}\n\n`;
      } else if (item.type === "content-card") {
        text += `【内容卡片】\n`;
        if (item.content && item.content.length > 0) {
          item.content.forEach((contentItem) => {
            // 处理多行文本，保留换行
            const lines = contentItem.text.split("\n");
            if (lines.length === 1) {
              text += `• ${contentItem.text}\n`;
            } else {
              lines.forEach((line, index) => {
                if (line.trim()) {
                  if (index === 0) {
                    text += `• ${line}\n`;
                  } else {
                    text += `  ${line}\n`;
                  }
                }
              });
            }
          });
        }
        text += "\n";
      } else if (item.type === "image-card") {
        text += `【图片卡片】\n`;
        if (item.images && item.images.length > 0) {
          item.images.forEach((image) => {
            text += `📷 ${image.filename} (${image.src})\n`;
          });
        }
        text += "\n";
      }
    });

    exportDataPreview.textContent = text;
  } else if (exportFormat === "csv") {
    // CSV格式：类型,内容,创建时间
    let csv = "类型,内容,创建时间\n";

    contentItems.forEach((item) => {
      let row = `"${item.type}",`;

      if (item.type === "main-title" || item.type === "subtitle") {
        row += `"${item.text.replace(/"/g, '""')}",`;
      } else if (item.type === "content-card") {
        const contentText = item.content?.map((c) => c.text).join(" | ") || "";
        row += `"${contentText.replace(/"/g, '""')}",`;
      } else if (item.type === "image-card") {
        const imageText =
          item.images?.map((img) => img.filename).join(", ") || "";
        row += `"图片: ${imageText}",`;
      }

      row += `"${item.createdAt || new Date().toISOString()}"\n`;
      csv += row;
    });

    exportDataPreview.textContent = csv;
  }
}

// 导出数据
function exportData() {
  const exportFormat = document.querySelector(
    'input[name="exportFormat"]:checked',
  ).value;

  if (exportFormat === "json") {
    const data = {
      contentItems: contentItems,
      nextItemId: nextItemId,
      nextContentItemId: nextContentItemId,
      currentBackground: currentBackground,
      backgroundOpacity: backgroundOpacity,
      overlayOpacity: overlayOpacity,
      isLightMode: isLightMode,
      exportTime: new Date().toISOString(),
      version: "1.0",
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `内容导出_${new Date().toISOString().slice(0, 10)}.json`;

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    showCopyNotification();
    copyNotification.querySelector("span").textContent = "JSON数据导出成功！";
  } else if (exportFormat === "txt") {
    let text = "";
    contentItems.forEach((item) => {
      if (item.type === "main-title") {
        text += `### ${item.text}\n\n`;
      } else if (item.type === "subtitle") {
        text += `#### ${item.text}\n\n`;
      } else if (item.type === "content-card") {
        text += `【内容卡片】\n`;
        if (item.content && item.content.length > 0) {
          item.content.forEach((contentItem) => {
            const lines = contentItem.text.split("\n");
            if (lines.length === 1) {
              text += `• ${contentItem.text}\n`;
            } else {
              lines.forEach((line, index) => {
                if (line.trim()) {
                  if (index === 0) {
                    text += `• ${line}\n`;
                  } else {
                    text += `  ${line}\n`;
                  }
                }
              });
            }
          });
        }
        text += "\n";
      } else if (item.type === "image-card") {
        text += `【图片卡片】\n`;
        if (item.images && item.images.length > 0) {
          item.images.forEach((image) => {
            text += `📷 ${image.filename}\n`;
            text += `${image.src}\n`;
          });
        }
        text += "\n";
      }
    });

    const dataBlob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `内容导出_${new Date().toISOString().slice(0, 10)}.txt`;

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    showCopyNotification();
    copyNotification.querySelector("span").textContent = "TXT文件导出成功！";
  } else if (exportFormat === "csv") {
    // CSV导出
    let csv = "类型,内容,创建时间\n";

    contentItems.forEach((item) => {
      let row = `"${item.type}",`;

      if (item.type === "main-title" || item.type === "subtitle") {
        row += `"${item.text.replace(/"/g, '""')}",`;
      } else if (item.type === "content-card") {
        const contentText = item.content?.map((c) => c.text).join(" | ") || "";
        row += `"${contentText.replace(/"/g, '""')}",`;
      } else if (item.type === "image-card") {
        const imageText =
          item.images?.map((img) => img.filename).join(", ") || "";
        row += `"图片: ${imageText}",`;
      }

      row += `"${item.createdAt || new Date().toISOString()}"\n`;
      csv += row;
    });

    const dataBlob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `内容导出_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    showCopyNotification();
    copyNotification.querySelector("span").textContent = "CSV文件导出成功！";
  }

  setTimeout(() => {
    importExportModal.classList.remove("active");
  }, 500);
}

// 预览导入文件
// 更新预览导入文件函数
function previewImportFile(file) {
  const previewArea = importPreview;
  previewArea.innerHTML = "";

  if (!file) {
    previewArea.innerHTML = "<p>预览区域</p>";
    return;
  }

  // 清除之前的数据
  previewArea.dataset.parsedData = "";

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".json")) {
        // JSON文件处理
        const data = JSON.parse(e.target.result);

        if (!data.contentItems || !Array.isArray(data.contentItems)) {
          throw new Error("无效的JSON数据格式");
        }

        let previewText = "=== JSON文件预览 ===\n\n";
        data.contentItems.forEach((item) => {
          if (item.type === "main-title") {
            previewText += `• [大标题] ${item.text}\n`;
          } else if (item.type === "subtitle") {
            previewText += `  [小标题] ${item.text}\n`;
          } else if (item.type === "content-card") {
            previewText += `  [内容卡片] ${item.content?.length || 0} 条内容\n`;
          } else if (item.type === "image-card") {
            previewText += `  [图片卡片] ${item.images?.length || 0} 张图片\n`;
          }
        });

        previewText += `\n总计: ${data.contentItems.length} 个项目`;
        previewArea.textContent = previewText;

        // 保存数据用于导入
        previewArea.dataset.parsedData = JSON.stringify(data);
      } else if (fileName.endsWith(".txt") || fileName.endsWith(".text")) {
        // TXT文件处理 - 使用现有的智能解析器
        const txtContent = e.target.result;

        if (typeof parseTxtContent !== "undefined") {
          // 使用现有解析器
          const parsedItems = parseTxtContent(txtContent);

          let previewText = "=== TXT文件智能解析 ===\n\n";

          // 统计信息
          const titles = parsedItems.filter(
            (item) => item.type === "main-title",
          ).length;
          const subtitles = parsedItems.filter(
            (item) => item.type === "subtitle",
          ).length;
          const images = parsedItems.filter(
            (item) => item.type === "image-card",
          ).length;
          const contentCards = parsedItems.filter(
            (item) => item.type === "content-card",
          ).length;

          previewText += "【统计信息】\n";
          previewText += `大标题: ${titles} 个\n`;
          previewText += `小标题: ${subtitles} 个\n`;
          previewText += `图片卡片: ${images} 个\n`;
          previewText += `内容卡片: ${contentCards} 个\n`;
          previewText += `总计项目: ${parsedItems.length} 个\n\n`;

          // 显示前几个项目
          previewText += "【内容示例】\n";
          const sampleCount = Math.min(3, parsedItems.length);
          for (let i = 0; i < sampleCount; i++) {
            const item = parsedItems[i];
            previewText += `${i + 1}. [${item.type}] `;

            if (item.type === "main-title") {
              previewText += `"${item.text}"\n`;
            } else if (item.type === "subtitle") {
              previewText += `"${item.text}"\n`;
            } else if (item.type === "content-card") {
              previewText += `包含 ${item.content?.length || 0} 条内容\n`;
              if (item.content && item.content.length > 0) {
                previewText += `  示例: "${item.content[0].text.substring(0, 50)}${item.content[0].text.length > 50 ? "..." : ""}"\n`;
              }
            } else if (item.type === "image-card") {
              previewText += `图片: ${item.images?.[0]?.filename || "未命名"}\n`;
            }
          }

          previewArea.textContent = previewText;

          // 保存解析数据
          previewArea.dataset.parsedData = JSON.stringify({
            contentItems: parsedItems,
            parsedFromTxt: true,
            originalFileType: "txt",
          });
        }
      } else if (fileName.endsWith(".csv")) {
        // CSV文件处理
        const csvContent = e.target.result;
        const parsedItems = parseCSVContent(csvContent);

        let previewText = "=== CSV文件解析 ===\n\n";

        // 统计信息
        const titles = parsedItems.filter(
          (item) => item.type === "main-title",
        ).length;
        const subtitles = parsedItems.filter(
          (item) => item.type === "subtitle",
        ).length;
        const images = parsedItems.filter(
          (item) => item.type === "image-card",
        ).length;
        const contentCards = parsedItems.filter(
          (item) => item.type === "content-card",
        ).length;

        previewText += "【统计信息】\n";
        previewText += `大标题: ${titles} 个\n`;
        previewText += `小标题: ${subtitles} 个\n`;
        previewText += `图片卡片: ${images} 个\n`;
        previewText += `内容卡片: ${contentCards} 个\n`;
        previewText += `总计项目: ${parsedItems.length} 个\n\n`;

        // 显示前几个项目
        previewText += "【内容示例】\n";
        const sampleCount = Math.min(3, parsedItems.length);
        for (let i = 0; i < sampleCount; i++) {
          const item = parsedItems[i];
          previewText += `${i + 1}. [${item.type}] `;

          if (item.type === "main-title") {
            previewText += `"${item.text}"\n`;
          } else if (item.type === "subtitle") {
            previewText += `"${item.text}"\n`;
          } else if (item.type === "content-card") {
            previewText += `包含 ${item.content?.length || 0} 条内容\n`;
          }
        }

        previewArea.textContent = previewText;

        // 保存解析数据
        previewArea.dataset.parsedData = JSON.stringify({
          contentItems: parsedItems,
          parsedFromCSV: true,
          originalFileType: "csv",
        });
      } else {
        previewArea.innerHTML = `<p style="color: #ff6666;">不支持的文件格式，请选择JSON、TXT或CSV文件</p>`;
      }
    } catch (error) {
      console.error("文件预览失败:", error);
      previewArea.innerHTML = `<p style="color: #ff6666;">文件解析失败: ${error.message}</p>`;
    }
  };

  reader.onerror = function () {
    previewArea.innerHTML = `<p style="color: #ff6666;">文件读取失败</p>`;
  };

  reader.readAsText(file, "UTF-8");
}

// 新增CSV解析函数
function parseCSVContent(csvContent) {
  const parsedItems = [];
  const lines = csvContent.split("\n");

  if (lines.length < 2) return parsedItems;

  // 跳过标题行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 简单的CSV解析，处理带引号的内容
    const cells = [];
    let inQuotes = false;
    let currentCell = "";

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        cells.push(currentCell);
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell);

    if (cells.length >= 2) {
      const type = cells[0].replace(/"/g, "").trim();
      const content = cells[1].replace(/"/g, "").trim();
      const createdAt = cells[2]
        ? cells[2].replace(/"/g, "").trim()
        : new Date().toISOString();

      if (type && content) {
        if (type === "main-title" || type === "subtitle") {
          parsedItems.push({
            id: nextTextId++,
            type: type,
            text: content,
            order: parsedItems.length + 1,
            parentId: null,
            createdAt: createdAt,
          });
        } else if (type === "content-card") {
          // CSV中的内容卡片可能用 | 分隔多个内容
          const contentItems = content.split("|").map((text) => ({
            id: nextTextId++,
            type: "content",
            text: text.trim(),
          }));

          parsedItems.push({
            id: nextTextId++,
            type: "content-card",
            content: contentItems,
            order: parsedItems.length + 1,
            parentId: null,
            createdAt: createdAt,
          });
        } else if (type === "image-card") {
          // CSV中的图片卡片：图片: 文件名1, 文件名2
          const imageMatch = content.match(/图片:\s*(.+)/);
          if (imageMatch) {
            const filenames = imageMatch[1].split(",").map((f) => f.trim());
            const images = filenames.map((filename) => ({
              id: nextTextId++,
              src: `./images/${filename}`,
              filename: filename,
              uploadedAt: new Date().toISOString(),
            }));

            parsedItems.push({
              id: nextTextId++,
              type: "image-card",
              images: images,
              order: parsedItems.length + 1,
              parentId: null,
              createdAt: createdAt,
            });
          }
        }
      }
    }
  }

  return parsedItems;
}

// ============ 完整导入功能（集成自定义弹窗与 ID 同步） ============
async function importData() {
  const file = importFileInput.files[0];

  // 1. 检查文件选择
  if (!file) {
    await Modal.alert("请先选择一个文件后再进行导入操作。", "提示");
    return;
  }

  const previewArea = importPreview;
  const parsedData = previewArea.dataset.parsedData;

  // 2. 检查预览数据
  if (!parsedData) {
    await Modal.alert("请先点击预览按钮确认文件内容是否正确。", "预览缺失");
    return;
  }

  try {
    const data = JSON.parse(parsedData);

    // 检查是否从 TXT 解析而来
    const isFromTxt = data.parsedFromTxt || false;
    const itemsToImport = data.contentItems || data;

    // 3. 检查数据有效性
    if (!Array.isArray(itemsToImport) || itemsToImport.length === 0) {
      await Modal.alert(
        "该文件中没有找到任何有效的内容项，请检查文件格式。",
        "导入失败",
      );
      return;
    }

    // 构建确认消息（统计信息）
    let confirmMessage = `确定要导入 ${itemsToImport.length} 个内容项吗？`;

    if (isFromTxt) {
      const titles = itemsToImport.filter(
        (item) => item.type === "main-title",
      ).length;
      const subtitles = itemsToImport.filter(
        (item) => item.type === "subtitle",
      ).length;
      const images = itemsToImport.filter(
        (item) => item.type === "image-card",
      ).length;
      const contentCards = itemsToImport.filter(
        (item) => item.type === "content-card",
      ).length;

      confirmMessage = `确定要导入 ${itemsToImport.length} 个内容项吗？\n\nTXT解析结果：\n• ${titles} 个大标题\n• ${subtitles} 个小标题\n• ${images} 组图片卡\n• ${contentCards} 个内容卡片`;
    }

    // 4. 确认导入操作
    const fullConfirmMessage =
      confirmMessage + "\n\n注意：导入操作将替换当前页面上的所有内容！";
    const isConfirmed = await Modal.confirm(fullConfirmMessage, "确认导入");

    if (!isConfirmed) return;

    // --- 开始执行数据覆盖逻辑 ---

    // 清空现有内容
    contentItems = [];

    if (isFromTxt) {
      // --- 情况 A: TXT 解析的数据导入 ---
      contentItems = itemsToImport;

      // 自动更新全局 ID 计数器，防止后续新增内容时 ID 冲突
      // 更新主项目 ID
      if (itemsToImport.length > 0) {
        const maxId = Math.max(...itemsToImport.map((item) => item.id || 0));
        nextItemId = Math.max(nextItemId, maxId + 1);
      }

      // 更新子内容项 ID (Content Card 内部项)
      const allSubItems = itemsToImport
        .filter((item) => item.type === "content-card")
        .flatMap((item) => item.content || []);
      if (allSubItems.length > 0) {
        const maxSubId = Math.max(...allSubItems.map((item) => item.id || 0));
        nextContentItemId = Math.max(nextContentItemId, maxSubId + 1);
      }

      // 更新图片 ID
      const allImages = itemsToImport
        .filter((item) => item.type === "image-card")
        .flatMap((item) => item.images || []);
      if (allImages.length > 0) {
        const maxImgId = Math.max(...allImages.map((img) => img.id || 0));
        nextImageId = Math.max(nextImageId, maxImgId + 1);
      }
    } else {
      // --- 情况 B: 标准 JSON 数据导入 ---
      contentItems = data.contentItems || [];
      nextItemId = data.nextItemId || nextItemId;
      nextContentItemId = data.nextContentItemId || nextContentItemId;
      if (data.nextImageId) nextImageId = data.nextImageId;

      // 恢复背景设置
      if (data.currentBackground) {
        currentBackground = data.currentBackground;
        setBackground(
          currentBackground.type,
          currentBackground.src,
          currentBackground.isLocalFile || false,
        );
      }

      // 恢复透明度设置
      if (data.backgroundOpacity) {
        setOpacity(
          data.backgroundOpacity,
          data.overlayOpacity || data.backgroundOpacity,
        );
      }

      // 恢复主题模式
      if (typeof data.isLightMode !== "undefined") {
        setTheme(data.isLightMode);
      }
    }

    // 5. 持久化与刷新页面
    initPage();
    saveToLocalStorage();

    // 6. 成功反馈
    showCopyNotification();
    const notifySpan = document.querySelector("#copyNotification span");
    if (notifySpan) {
      notifySpan.textContent = `成功导入 ${itemsToImport.length} 个内容项！`;
    }

    // 7. 关闭导入弹窗
    if (typeof importExportModal !== "undefined") {
      setTimeout(() => {
        importExportModal.classList.remove("active");
      }, 500);
    }
  } catch (error) {
    console.error("Import Error:", error);
    await Modal.alert(`导入过程中发生错误: ${error.message}`, "错误");
  }
}

// 自动隐藏功能
function initAutoHideSettings() {
  autoHideTimeInput.value = autoHideTime;
  enableAutoHide.checked = autoHideEnabled;

  if (autoHideEnabled) {
    startAutoHideTimer();
  } else {
    stopAutoHideTimer();
    showAllElements();
  }

  setupAutoHideListeners();
}

function setupAutoHideListeners() {
  if (autoHideTimeInput) {
    autoHideTimeInput.addEventListener("input", function () {
      const value = parseInt(this.value);
      if (value < 5) this.value = 5;
      if (value > 300) this.value = 300;
    });

    autoHideTimeInput.addEventListener("change", saveAutoHideSettings);
  }

  if (enableAutoHide) {
    enableAutoHide.addEventListener("change", saveAutoHideSettings);
  }
}

function startAutoHideTimer() {
  stopAutoHideTimer();

  if (autoHideEnabled && autoHideTime > 0) {
    hideTimeout = setTimeout(() => {
      if (!mouseInWindow) {
        hideContentElements();
      }
    }, autoHideTime * 1000);
  }
}

function stopAutoHideTimer() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

function hideContentElements() {
  const sidebar = document.querySelector(".sidebar");
  const contentArea = document.querySelector(".content-area");
  const mainContent = document.querySelector(".main-content");

  if (sidebar) sidebar.classList.add("hidden");
  if (contentArea) contentArea.classList.add("hidden");
  if (mainContent) mainContent.classList.add("hidden");
}

function showAllElements() {
  const sidebar = document.querySelector(".sidebar");
  const contentArea = document.querySelector(".content-area");
  const mainContent = document.querySelector(".main-content");

  if (sidebar) sidebar.classList.remove("hidden");
  if (contentArea) contentArea.classList.remove("hidden");
  if (mainContent) mainContent.classList.remove("hidden");
}

function resetAutoHideTimer() {
  if (autoHideEnabled) {
    showAllElements();
    startAutoHideTimer();
  }
}

function saveAutoHideSettings() {
  autoHideTime = parseInt(autoHideTimeInput.value) || 20;
  autoHideEnabled = enableAutoHide.checked;

  if (autoHideTime < 5) autoHideTime = 5;
  if (autoHideTime > 300) autoHideTime = 300;
  autoHideTimeInput.value = autoHideTime;

  if (autoHideEnabled) {
    startAutoHideTimer();
  } else {
    stopAutoHideTimer();
    showAllElements();
  }

  saveToLocalStorage();
}

// 事件监听
addMainTitleBtn.addEventListener("click", () => openAddModal("main-title"));
addSubtitleBtn.addEventListener("click", () => openAddModal("subtitle"));
addContentBtn.addEventListener("click", () => openAddModal("content-card"));
themeToggleBtn.addEventListener("click", toggleTheme);

closeModal.addEventListener("click", () => {
  modalOverlay.classList.remove("active");
  currentEditItemId = null;
  currentEditCardItemId = null;
  currentContentCardId = null;
  currentInsertAfterId = null;
  currentItemType = "";
});

addMoreBtn.addEventListener("click", addNewTextarea);
contentForm.addEventListener("submit", saveContentItem);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove("active");
    currentEditItemId = null;
    currentEditCardItemId = null;
    currentContentCardId = null;
    currentInsertAfterId = null;
    currentItemType = "";
  }
});

// 右键菜单功能
editContextItem.addEventListener("click", () => {
  openEditModal();
  contextMenu.classList.remove("active");
});

insertAfterContextItem.addEventListener("click", () => {
  openInsertAfterModal();
  contextMenu.classList.remove("active");
});

insertMainTitleAfterItem.addEventListener("click", () => {
  openInsertMainTitleAfterModal();
  contextMenu.classList.remove("active");
});

insertSubtitleAfterItem.addEventListener("click", () => {
  openInsertSubtitleAfterModal();
  contextMenu.classList.remove("active");
});

addContextItem.addEventListener("click", () => {
  if (contextMenuTarget && contextMenuTarget.type === "content-card") {
    currentItemType = "content-card";
    currentEditItemId = contextMenuTarget.id;
    openEditModal();
  } else {
    let type = "main-title";
    if (contextMenuTarget) {
      if (contextMenuTarget.type === "main-title") {
        type = "main-title";
      } else if (contextMenuTarget.type === "subtitle") {
        type = "subtitle";
      } else if (contextMenuTarget.type === "content-card") {
        type = "content-card";
      }
    }
    openAddModal(type);
  }
  contextMenu.classList.remove("active");
});

deleteContextItem.addEventListener("click", () => {
  deleteContentItem();
  contextMenu.classList.remove("active");
});

// 全局事件
document.addEventListener("click", (e) => {
  // 1. 触发视觉特效 (新增)
  VISUAL_EFFECTS.triggerAll(e);

  // 2. 原有逻辑：重置自动隐藏计时器
  resetAutoHideTimer();

  // 3. 原有逻辑：关闭右键菜单
  // 检查是否点击了菜单内部，如果没有则关闭
  if (contextMenu && contextMenu.classList.contains("active")) {
    // 如果点击的不是菜单本身且不是触发菜单的元素，则关闭
    if (!e.target.closest("#contextMenu")) {
      contextMenu.classList.remove("active");
      contextMenuTarget = null;
    }
  }

  // 4. 原有逻辑：关闭背景选择等模态框外部点击 (如果模态框代码里没处理好冒泡)
  // 此处保留你原有的逻辑即可，通常模态框有自己的监听器
});

document.addEventListener("contextmenu", (e) => {
  if (
    e.target.closest(".content-item") ||
    e.target.closest(".main-title") ||
    e.target.closest(".subtitle") ||
    e.target.closest(".content-card")
  ) {
    e.preventDefault();
  }
});

// 自动隐藏事件
document.addEventListener("mousemove", () => {
  mouseInWindow = true;
  resetAutoHideTimer();
});

document.addEventListener("mouseenter", () => {
  mouseInWindow = true;
  resetAutoHideTimer();
});

document.addEventListener("mouseleave", (e) => {
  if (
    e.clientY <= 0 ||
    e.clientX <= 0 ||
    e.clientX >= window.innerWidth ||
    e.clientY >= window.innerHeight
  ) {
    mouseInWindow = false;
    resetAutoHideTimer();
  }
});

document.addEventListener("keydown", resetAutoHideTimer);
document.addEventListener("click", resetAutoHideTimer);

window.addEventListener("resize", () => {});
window.addEventListener("beforeunload", saveToLocalStorage);

// ============ 全局自定义弹窗管理器 ============
/**
 * 全局自定义弹窗对象
 * 支持 Promise 异步调用：await Modal.confirm("内容")
 */
const Modal = {
  // 核心显示逻辑
  show: function ({
    title = "提示",
    message = "",
    type = "confirm", // 'confirm' 或 'alert'
    onConfirm = null,
  }) {
    let overlay = document.getElementById("globalCustomModal");

    // 1. 如果不存在则创建结构
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "globalCustomModal";
      overlay.className = "custom-modal-overlay";
      overlay.innerHTML = `
        <div class="custom-modal-content">
          <div class="custom-modal-icon"></div>
          <div class="custom-modal-title"></div>
          <div class="custom-modal-message"></div>
          <div class="custom-modal-actions">
            <button class="modal-btn cancel-btn">取消</button>
            <button class="modal-btn confirm-btn">确定</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    const iconEl = overlay.querySelector(".custom-modal-icon");
    const titleEl = overlay.querySelector(".custom-modal-title");
    const msgEl = overlay.querySelector(".custom-modal-message");
    const confirmBtn = overlay.querySelector(".confirm-btn");
    const cancelBtn = overlay.querySelector(".cancel-btn");

    // 2. 根据类型动态设置内容和外观
    overlay.className = `custom-modal-overlay modal-type-${type}`;
    titleEl.textContent = title;
    msgEl.textContent = message;

    // 设置图标：alert 用感叹号，confirm 用问号
    iconEl.innerHTML =
      type === "alert"
        ? '<i class="fas fa-exclamation-circle"></i>'
        : '<i class="fas fa-question-circle"></i>';

    // 激活显示（触发 CSS 动画）
    requestAnimationFrame(() => {
      overlay.classList.add("active");
    });

    // 3. 事件处理：使用 Promise 封装
    return new Promise((resolve) => {
      // 封装关闭逻辑（带动画延迟）
      const close = (result) => {
        overlay.classList.remove("active");
        // 等待 CSS 中的 0.3s/0.4s 动画结束后再彻底 resolve
        setTimeout(() => {
          if (result && onConfirm) onConfirm();
          resolve(result);
        }, 300);
      };

      // 绑定点击事件
      confirmBtn.onclick = (e) => {
        e.stopPropagation();
        close(true);
      };

      cancelBtn.onclick = (e) => {
        e.stopPropagation();
        close(false);
      };

      // 点击遮罩层背景关闭（等同于取消）
      overlay.onclick = (e) => {
        if (e.target === overlay) close(false);
      };
    });
  },

  /**
   * 替代系统自带的 alert
   * @param {string} message 提示消息
   * @param {string} title 标题
   */
  alert: function (message, title = "提醒") {
    // 以后都只给我一条最推荐的翻译：使用 await 方式调用
    return this.show({ title, message, type: "alert" });
  },

  /**
   * 替代系统自带的 confirm
   * @param {string} message 询问消息
   * @param {string} title 标题
   */
  confirm: function (message, title = "确认操作") {
    return this.show({ title, message, type: "confirm" });
  },
};

function createRipple(x, y, size) {
  if (rippleCount >= RIPPLE_CONFIG.maxRipples) return;

  const ripple = document.createElement("div");
  ripple.className = "mouse-ripple";

  // 颜色可以根据需要在这里随机设置，让它更鲜艳
  const colors = ["#00f2fe", "#fb00ff", "#39ff14", "#ffef00"];
  const activeColor = colors[Math.floor(Math.random() * colors.length)];
  ripple.style.borderColor = activeColor;
  ripple.style.boxShadow = `0 0 15px ${activeColor}`;

  ripple.style.left = x + "px";
  ripple.style.top = y + "px";
  ripple.style.width = size + "px";
  ripple.style.height = size + "px";

  // 初始状态：极小
  ripple.style.transform = "translate(-50%, -50%) scale(0)";
  ripple.style.opacity = "0.5";

  document.getElementById("mouse-ripple-container").appendChild(ripple);
  rippleCount++;

  // 触发扩散动画
  requestAnimationFrame(() => {
    ripple.style.transform = `translate(-50%, -50%) scale(1)`;
    ripple.style.opacity = "0";
  });

  // 结束后移除
  setTimeout(() => {
    ripple.remove();
    rippleCount--;
  }, RIPPLE_CONFIG.animationDuration);
}

// 在您的JavaScript中添加：
document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      if (this.classList.contains("active")) return;

      // 移除所有active状态
      navItems.forEach((nav) => {
        nav.classList.remove("active", "animated", "breathing", "after-bounce");
      });

      // 添加基础active
      this.classList.add("active");

      // 延迟添加animated类，避免同时加载所有动画
      setTimeout(() => {
        this.classList.add("animated");

        // 进一步延迟添加呼吸效果
        setTimeout(() => {
          this.classList.add("breathing");
        }, 1000);

        // 添加微震动效果
        setTimeout(() => {
          this.classList.add("after-bounce");
        }, 1300);
      }, 50);
    });
  });
});

// 主初始化函数
function initializeApp() {
  initBackgroundSelector();
  initOpacityControl();
  initImportExport();
  initPage(); // 页面内容渲染在这里完成
  initAutoHideSettings();
  initImageFunctions();

  // 滚动监听（如果存在）
  if (typeof initScrollSpy === "function") {
    initScrollSpy();
  }

  // 窗口尺寸变化时自动关闭右键菜单
  window.addEventListener("resize", () => {
    if (contextMenu?.classList.contains("active")) {
      contextMenu.classList.remove("active");
    }
  });

  // TXT 导入功能（如果存在）
  if (typeof initTxtImportFunctions === "function") {
    initTxtImportFunctions();
  }

  document.addEventListener("mousemove", (e) => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;

    // 1. 稍微降低间隔时间（从50改为30），让尾巴更连贯
    if (deltaTime > 30) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2),
      );

      // 2. 这里的 size 决定了圆环扩散后的最终大小
      // 我们让它随速度稍微变大，但保持在一个精致的范围内
      const size = Math.min(
        RIPPLE_CONFIG.maxSize,
        RIPPLE_CONFIG.baseSize + distance * 1.5, // 降低系数，让圈圈别太大
      );

      // 3. 降低距离阈值（从10改为5），这样慢速移动时也会有细腻的尾巴
      if (distance > 5) {
        createRipple(e.clientX, e.clientY, size);

        lastX = e.clientX;
        lastY = e.clientY;
        lastTime = currentTime;
      }
    }
  });
}

/**
 * 滚动监听功能：自动高亮导航栏
 */
function initScrollSpy() {
  window.addEventListener(
    "scroll",
    () => {
      let currentId = "";
      // 获取所有的大标题元素
      const sections = document.querySelectorAll(".main-title-item");

      // 获取当前滚动条位置（加上一个偏移量，让触发更灵敏）
      const scrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      const offset = 150; // 触发阈值

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        // 如果滚动到了某个章节的范围内
        if (scrollPosition >= sectionTop - offset) {
          // 获取该章节对应的 ID
          const idAttr = section.getAttribute("id");
          if (idAttr) {
            currentId = idAttr.replace("item-", "");
          }
        }
      });

      // 更新导航栏状态
      const navItems = document.querySelectorAll(".nav-item");

      // 如果没有匹配到任何 ID（比如在页面最顶端），默认高亮第一个（可选）
      if (currentId === "" && navItems.length > 0) {
        // navItems[0].classList.add("active");
      }

      navItems.forEach((nav) => {
        // 核心修正：dataset.id 是字符串，确保对比逻辑准确
        if (nav.dataset.id === currentId.toString()) {
          nav.classList.add("active");
        } else {
          nav.classList.remove("active");
        }
      });
    },
    { passive: true },
  );
}

// 页面加载完成后初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM已加载完成，开始初始化应用...");
    initializeApp();

    const editImagesItem = document.getElementById("editImagesItem");
    if (editImagesItem) {
      editImagesItem.addEventListener("click", () => {
        if (contextMenuTarget && contextMenuTarget.type === "image-card") {
          // 调用图片编辑功能
          if (typeof openEditImageModal === "function") {
            openEditImageModal();
          }
        }
        contextMenu.classList.remove("active");
      });
    }
  });
} else {
  console.log("文档已经加载完成，立即初始化...");
  initializeApp();
}

/* ==================== 新增：全能点击特效管理器 (超慢动作版) ==================== */

const VISUAL_EFFECTS = {
  // 配置
  symbols: ["❤️", "⭐", "✨", "🌸", "🔥", "💎", "🎵", "🦋", "🍀"],
  colors: [
    "#ff00cc",
    "#3333ff",
    "#00ffcc",
    "#ffcc00",
    "#ff3366",
    "#00f2fe",
    "#ffffff",
  ],

  // 入口函数
  triggerAll: function (e) {
    const x = e.clientX;
    const y = e.clientY;

    this.createRipple(x, y);
    this.createFloater(x, y);
    this.createParticles(x, y);
    this.createMagicRing(x, y);
    this.createBurstLines(x, y);

    const targetEl = e.target.closest(
      ".content-item, .content-card, .position-btn, .nav-item, .image-item, .viewer-action-btn",
    );
    if (targetEl) {
      this.triggerBorderEffect(targetEl);
    }
  },

  // 1. 全屏柔光波纹 (对应 CSS: 2s -> 设置 2000ms)
  createRipple: function (x, y) {
    const ripple = document.createElement("div");
    ripple.className = "click-ripple";

    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    ripple.style.background = `radial-gradient(circle, ${color}25 0%, ${color}00 65%)`; // 25透明度更淡

    const size = Math.max(window.innerWidth, window.innerHeight) * 0.9;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 2000);
  },

  // 2. 爱心/星星 (对应 CSS: 4s -> 设置 4000ms)
  createFloater: function (x, y) {
    const floater = document.createElement("div");
    floater.className = "click-floater";

    floater.innerText =
      this.symbols[Math.floor(Math.random() * this.symbols.length)];
    const offsetX = (Math.random() - 0.5) * 50;
    floater.style.left = `${x + offsetX}px`;
    floater.style.top = `${y}px`;

    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    floater.style.color = color;

    document.body.appendChild(floater);
    setTimeout(() => floater.remove(), 4000);
  },

  // 3. 粒子爆炸 (对应 CSS: 2.5s -> 设置 2500ms)
  createParticles: function (x, y) {
    const particleCount = 14; // 稍微增加粒子数

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "click-particle";

      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 10px ${color}`;

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      const angle = Math.random() * Math.PI * 2;
      const velocity = 100 + Math.random() * 140; // 扩散得更远
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      particle.style.setProperty("--tx", `${tx}px`);
      particle.style.setProperty("--ty", `${ty}px`);

      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 2500);
    }
  },

  // 4. 魔法法阵 (对应 CSS: 2.5s -> 设置 2500ms)
  createMagicRing: function (x, y) {
    const ring = document.createElement("div");
    ring.className = "click-magic-ring";

    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    ring.style.borderColor = color;
    ring.style.boxShadow = `0 0 15px ${color}`;

    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;

    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 2500);
  },

  // 5. 极速光线 (对应 CSS: 1.5s -> 设置 1500ms)
  createBurstLines: function (x, y) {
    const lineCount = 10;

    for (let i = 0; i < lineCount; i++) {
      const line = document.createElement("div");
      line.className = "click-burst-line";

      const angle = (360 / lineCount) * i + Math.random() * 15;
      line.style.setProperty("--angle", `${angle}deg`);

      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      line.style.background = `linear-gradient(to bottom, transparent, ${color}, transparent)`;

      line.style.left = `${x}px`;
      line.style.top = `${y}px`;

      document.body.appendChild(line);
      setTimeout(() => line.remove(), 1500);
    }
  },

  // 6. 流光边框 (对应 CSS: 2s -> 设置 2000ms)
  triggerBorderEffect: function (element) {
    element.classList.remove("click-highlight-border");
    void element.offsetWidth;
    element.classList.add("click-highlight-border");
    setTimeout(() => {
      element.classList.remove("click-highlight-border");
    }, 2000);
  },
};
