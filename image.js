// images.js - 图片管理功能扩展

// ============ 需要添加到现有 index.js 顶部的变量 ============
/*
// 在 index.js 的变量声明区域添加：
let nextImageId = parseInt(localStorage.getItem("contentSystemNextImageId")) || 1001;

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
*/

// ============ 图片功能初始化 ============
function initImageFunctions() {
  console.log("初始化图片功能...");

  // 检查必要的DOM元素
  if (!addImagesBtn || !imageModal) {
    console.error("图片功能所需的DOM元素未找到，请确保HTML已正确更新");
    return;
  }

  // 添加图片按钮事件
  addImagesBtn.addEventListener("click", () => openAddImageModal());

  // 右键菜单插入图片事件
  if (insertImagesAfterItem) {
    insertImagesAfterItem.addEventListener("click", () => {
      openInsertImageModal();
      if (contextMenu) {
        contextMenu.classList.remove("active");
      }
    });
  }

  // 添加编辑图片的事件监听
  const editImagesItem = document.getElementById("editImagesItem");
  if (editImagesItem) {
    editImagesItem.addEventListener("click", () => {
      openEditImageModal();
      if (contextMenu) {
        contextMenu.classList.remove("active");
      }
    });
  }

  // 图片模态框关闭事件
  closeImageModal.addEventListener("click", () => {
    imageModal.classList.remove("active");
    clearImagePreview();
    resetImageForm();
  });

  // 图片上传区域事件
  imageUploadArea.addEventListener("click", function (e) {
    // 阻止事件冒泡，确保只触发一次
    e.stopPropagation();
    imageFileInput.click();
  });

  // 拖放功能
  imageUploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    imageUploadArea.style.borderColor = "#ff6b35";
    imageUploadArea.style.background = "rgba(255, 107, 53, 0.1)";
  });

  imageUploadArea.addEventListener("dragleave", () => {
    imageUploadArea.style.borderColor = "rgba(255, 255, 255, 0.2)";
    imageUploadArea.style.background = "rgba(255, 107, 53, 0.05)";
  });

  imageUploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    imageUploadArea.style.borderColor = "rgba(255, 255, 255, 0.2)";
    imageUploadArea.style.background = "rgba(255, 107, 53, 0.05)";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFiles(files);
    }
  });

  // 文件选择事件
  imageFileInput.addEventListener("change", function (e) {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFiles(e.target.files);
      // 重置input，允许选择同一文件
      e.target.value = "";
    }
  });

  // 图片表单提交事件
  imageForm.addEventListener("submit", saveImages);

  // 图片查看器事件
  closeImageViewer.addEventListener("click", closeImageViewerModal);
  prevImageBtn.addEventListener("click", showPrevImage);
  nextImageBtn.addEventListener("click", showNextImage);
  downloadImageBtn.addEventListener("click", downloadCurrentImage);
  copyImageUrlBtn.addEventListener("click", copyImage);
  deleteImageBtn.addEventListener("click", deleteCurrentImage);

  // 键盘导航
  document.addEventListener("keydown", (e) => {
    if (imageViewerModal.classList.contains("active")) {
      if (e.key === "ArrowLeft") showPrevImage();
      if (e.key === "ArrowRight") showNextImage();
      if (e.key === "Escape") closeImageViewerModal();
    }
  });

  // 点击模态框外部关闭
  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.classList.remove("active");
      clearImagePreview();
      resetImageForm();
    }
  });

  imageViewerModal.addEventListener("click", (e) => {
    // 检查点击的目标元素
    const target = e.target;

    // 这些元素点击时不关闭查看器
    const noCloseElements = [
      viewerImage,
      prevImageBtn,
      nextImageBtn,
      downloadImageBtn,
      copyImageUrlBtn,
      deleteImageBtn,
      closeImageViewer,
      currentImageIndex,
      totalImages,
    ];

    // 检查是否是图片容器或图片本身
    const isImageContainer = target.closest(".image-container");
    const isViewerImage =
      target === viewerImage || target.closest("#viewerImage");

    // 如果点击了这些元素，不关闭查看器
    if (
      noCloseElements.includes(target) ||
      target.closest(".nav-btn") ||
      target.closest(".viewer-action-btn") ||
      target.closest("#closeImageViewer") ||
      isImageContainer ||
      isViewerImage
    ) {
      return;
    }

    // 其他情况都关闭查看器
    closeImageViewerModal();
  });

  console.log("图片功能初始化完成");
}

// ============ 图片处理函数 ============
// 处理上传的图片文件
function handleImageFiles(files) {
  const imageFiles = Array.from(files).filter((file) =>
    file.type.startsWith("image/"),
  );

  if (imageFiles.length === 0) {
    alert("请选择图片文件（JPG、PNG、GIF等格式）");
    return;
  }

  if (imageFiles.length > 20) {
    alert("一次最多上传20张图片");
    return;
  }

  imageFiles.forEach((file) => {
    // 检查文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert(`文件 ${file.name} 超过5MB大小限制`);
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      addImageToPreview(e.target.result, file.name);
    };
    reader.onerror = function () {
      alert(`文件 ${file.name} 读取失败`);
    };
    reader.readAsDataURL(file);
  });
}

// 添加图片到预览区
function addImageToPreview(dataUrl, filename) {
  const previewItem = document.createElement("div");
  previewItem.className = "preview-image-item";

  const shortName =
    filename.length > 15 ? filename.substring(0, 12) + "..." : filename;

  previewItem.innerHTML = `
    <img src="${dataUrl}" alt="预览" loading="lazy">
    <button class="remove-preview-btn" onclick="removePreviewImage(this)">&times;</button>
    <div class="preview-filename">${shortName}</div>
  `;

  previewItem.dataset.src = dataUrl;
  previewItem.dataset.filename = filename;

  imagePreviewArea.appendChild(previewItem);
}

// 全局函数：移除预览图片
function removePreviewImage(btn) {
  const previewItem = btn.closest(".preview-image-item");
  if (previewItem) {
    previewItem.remove();
  }
}

// 清空图片预览
function clearImagePreview() {
  imagePreviewArea.innerHTML = "";
  imageFileInput.value = "";
  imageUrlInput.value = "";
}

// 重置图片表单状态
function resetImageForm() {
  currentEditItemId = null;
  currentInsertAfterId = null;
  currentItemType = "image-card";
}

// ============ 图片模态框功能 ============

// 打开添加图片模态框
function openAddImageModal(type = "add") {
  currentItemType = "image-card";
  currentEditItemId = null;
  currentInsertAfterId = null;

  if (type === "insert" && contextMenuTarget) {
    currentInsertAfterId = contextMenuTarget.id;
    imageModalTitle.textContent = "插入图片";
  } else {
    imageModalTitle.textContent = "新增图片";
  }

  clearImagePreview();
  imageModal.classList.add("active");
}

// 打开插入图片模态框
function openInsertImageModal() {
  if (contextMenuTarget) {
    openAddImageModal("insert");
  }
}

// ============ 新增：打开编辑图片模态框 ============
function openEditImageModal() {
  if (!contextMenuTarget || contextMenuTarget.type !== "image-card") {
    console.error("未找到要编辑的图片卡片");
    return;
  }

  const itemIndex = contentItems.findIndex(
    (item) => item.id === contextMenuTarget.id,
  );

  if (itemIndex === -1 || !contentItems[itemIndex].images) {
    console.error("图片卡片数据不存在");
    return;
  }

  const item = contentItems[itemIndex];
  currentEditItemId = contextMenuTarget.id;
  currentItemType = "image-card";
  currentInsertAfterId = null;

  // 设置模态框标题
  imageModalTitle.textContent = `编辑图片 (${item.images.length} 张)`;

  // 清空预览区
  clearImagePreview();

  // 加载现有图片到预览区
  if (item.images && item.images.length > 0) {
    item.images.forEach((image) => {
      // 如果是base64或dataURL图片，直接使用
      if (image.src.startsWith("data:")) {
        addImageToPreview(image.src, image.filename);
      } else {
        // 如果是网络图片，需要显示图片（如果加载失败会显示默认图）
        const previewItem = document.createElement("div");
        previewItem.className = "preview-image-item";

        const shortName =
          image.filename && image.filename.length > 15
            ? image.filename.substring(0, 12) + "..."
            : image.filename || "网络图片";

        previewItem.innerHTML = `
          <img src="${image.src}" alt="预览" loading="lazy" 
               onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23333%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2212%22%3E网络图片%3C/text%3E%3C/svg%3E'">
          <button class="remove-preview-btn" onclick="removePreviewImage(this)">&times;</button>
          <div class="preview-filename">${shortName}</div>
        `;

        previewItem.dataset.src = image.src;
        previewItem.dataset.filename = image.filename || `image_${Date.now()}`;

        imagePreviewArea.appendChild(previewItem);
      }
    });
  }

  // 显示模态框
  imageModal.classList.add("active");
}

// 保存图片
function saveImages(e) {
  e.preventDefault();

  // 从预览区获取图片
  const previewImages = Array.from(
    imagePreviewArea.querySelectorAll(".preview-image-item"),
  ).map((item) => ({
    src: item.dataset.src,
    filename: item.dataset.filename || `image_${Date.now()}`,
  }));

  // 从URL输入框获取图片
  const urlImages = imageUrlInput.value
    .split("\n")
    .map((url) => url.trim())
    .filter((url) => {
      if (!url) return false;
      // 验证URL格式
      const urlPattern =
        /^(https?:\/\/).+\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i;
      return urlPattern.test(url);
    })
    .map((url) => ({
      src: url,
      filename: url.split("/").pop().split("?")[0] || `image_${Date.now()}`,
    }));

  const allImages = [...previewImages, ...urlImages];

  if (allImages.length === 0) {
    alert("请至少添加一张图片");
    return;
  }

  let updatedItemId = null;

  if (currentEditItemId) {
    // 编辑现有图片卡片
    const itemIndex = contentItems.findIndex(
      (item) => item.id === currentEditItemId,
    );
    if (itemIndex !== -1) {
      // 保留原有的图片ID（如果可能），或者生成新的ID
      contentItems[itemIndex].images = allImages.map((image, index) => {
        // 尝试使用现有的图片ID，如果没有则生成新的
        const existingImage = contentItems[itemIndex].images?.[index];
        return {
          id: existingImage?.id || nextImageId++,
          src: image.src,
          filename: image.filename,
          uploadedAt: existingImage?.uploadedAt || new Date().toISOString(),
        };
      });

      updatedItemId = currentEditItemId;
      currentEditItemId = null;
    }
  } else if (currentInsertAfterId) {
    // 插入新图片卡片
    const newItem = {
      id: nextItemId++,
      type: "image-card",
      images: allImages.map((image) => ({
        id: nextImageId++,
        src: image.src,
        filename: image.filename,
        uploadedAt: new Date().toISOString(),
      })),
      order: 0,
      parentId: null,
      createdAt: new Date().toISOString(),
    };

    insertContentAfter(currentInsertAfterId, newItem);
    updatedItemId = newItem.id;
    currentInsertAfterId = null;
  } else {
    // 新增图片卡片
    const newItem = {
      id: nextItemId++,
      type: "image-card",
      images: allImages.map((image) => ({
        id: nextImageId++,
        src: image.src,
        filename: image.filename,
        uploadedAt: new Date().toISOString(),
      })),
      order: contentItems.length + 1,
      parentId: null,
      createdAt: new Date().toISOString(),
    };

    contentItems.push(newItem);
    updatedItemId = newItem.id;
  }

  imageModal.classList.remove("active");
  clearImagePreview();
  resetImageForm();
  initPage();
  saveToLocalStorage();

  // 滚动到更新/新增的图片卡片
  if (updatedItemId) {
    setTimeout(() => {
      const itemElement = document.getElementById(`card-${updatedItemId}`);
      if (itemElement) {
        itemElement.scrollIntoView({ behavior: "smooth", block: "start" });

        const originalBg = itemElement.style.background;
        if (isLightMode) {
          itemElement.style.background = "rgba(255, 107, 53, 0.3)";
        } else {
          itemElement.style.background = "rgba(255, 107, 53, 0.3)";
        }

        setTimeout(() => {
          itemElement.style.background = originalBg;
        }, 1500);
      }
    }, 300);
  }
}

// 渲染图片卡片
function renderImageCard(item) {
  const imageCard = document.createElement("div");
  imageCard.className = "image-card";
  imageCard.id = `card-${item.id}`;
  imageCard.dataset.id = item.id;
  imageCard.dataset.type = "image-card";

  // 添加图片数量标签
  const imageCount = document.createElement("div");
  //   imageCount.className = "image-count-badge";
  //   imageCount.textContent = `${item.images ? item.images.length : 0} 张图片`;
  imageCard.appendChild(imageCount);

  // 右键菜单
  imageCard.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    contextMenuTarget = { type: "image-card", id: item.id };
    showContextMenu(e);
  });

  // 创建图片网格
  const imageGrid = document.createElement("div");
  imageGrid.className = "image-grid";

  if (item.images && item.images.length > 0) {
    item.images.forEach((image, index) => {
      const imageItem = document.createElement("div");
      imageItem.className = "image-item";
      imageItem.dataset.index = index;
      imageItem.dataset.cardId = item.id;
      imageItem.title = image.filename || `图片 ${index + 1}`;

      const img = document.createElement("img");
      img.src = image.src;
      img.alt = image.filename || "图片";
      img.loading = "lazy";
      img.onerror = function () {
        this.src =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='14'%3E图片加载失败%3C/text%3E%3C/svg%3E";
      };

      const overlay = document.createElement("div");
      overlay.className = "image-item-overlay";
      const shortName =
        image.filename && image.filename.length > 20
          ? image.filename.substring(0, 17) + "..."
          : image.filename || `图片 ${index + 1}`;
      overlay.textContent = shortName;

      // 点击查看图片
      imageItem.addEventListener("click", () => {
        openImageViewer(item.images, index, item.id);
      });

      imageItem.appendChild(img);
      imageItem.appendChild(overlay);
      imageGrid.appendChild(imageItem);
    });
  } else {
    // 如果没有图片，显示空状态
    const emptyState = document.createElement("div");
    emptyState.className = "image-empty-state";
    emptyState.innerHTML = '<i class="fas fa-image"></i><p>暂无图片</p>';
    imageGrid.appendChild(emptyState);
  }

  imageCard.appendChild(imageGrid);
  contentContainer.appendChild(imageCard);
}

// ============ 图片查看器功能 ============

// 打开图片查看器
function openImageViewer(images, startIndex, cardId) {
  currentViewingImages = images;
  currentViewingImageIndex = startIndex;
  currentViewingCardId = cardId;

  updateViewerImage();
  imageViewerModal.classList.add("active");

  // 防止背景滚动
  document.body.style.overflow = "hidden";
}

// 更新查看器中的图片
function updateViewerImage() {
  if (currentViewingImages.length === 0) {
    closeImageViewerModal();
    return;
  }

  const image = currentViewingImages[currentViewingImageIndex];
  viewerImage.src = image.src;
  viewerImage.alt = image.filename || "图片";

  currentImageIndex.textContent = currentViewingImageIndex + 1;
  totalImages.textContent = currentViewingImages.length;

  // 更新按钮状态
  prevImageBtn.disabled = currentViewingImageIndex === 0;
  nextImageBtn.disabled =
    currentViewingImageIndex === currentViewingImages.length - 1;

  // 更新按钮标题
  viewerImage.title = image.filename || `图片 ${currentViewingImageIndex + 1}`;
}

// 显示上一张图片
function showPrevImage() {
  if (currentViewingImageIndex > 0) {
    currentViewingImageIndex--;
    updateViewerImage();
  }
}

// 显示下一张图片
function showNextImage() {
  if (currentViewingImageIndex < currentViewingImages.length - 1) {
    currentViewingImageIndex++;
    updateViewerImage();
  }
}

// 关闭图片查看器
function closeImageViewerModal() {
  imageViewerModal.classList.remove("active");
  document.body.style.overflow = "";
  currentViewingImages = [];
  currentViewingImageIndex = 0;
  currentViewingCardId = null;
}

// 下载当前图片
function downloadCurrentImage() {
  const image = currentViewingImages[currentViewingImageIndex];

  // 对于base64图片
  if (image.src.startsWith("data:")) {
    const link = document.createElement("a");
    link.href = image.src;
    link.download = image.filename || `image_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // 对于网络图片，使用fetch下载
    fetch(image.src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = image.filename || `image_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("下载失败:", err);
        alert("图片下载失败，请尝试复制链接后手动下载");
      });
  }
}

// ============ 复制图片功能 ============
// ============ 终极复制图片功能（Canvas 渲染版） ============
async function copyImage() {
  const image = currentViewingImages[currentViewingImageIndex];
  const copyBtn = copyImageUrlBtn;

  // 保存原始状态
  const originalText = copyBtn.innerHTML;
  const originalClass = copyBtn.className;

  // UI 反馈
  copyBtn.classList.add("copying");
  copyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在处理图片...';
  copyBtn.disabled = true;

  try {
    // 1. 创建 Image 对象并加载图片
    const img = new Image();
    // 允许跨域请求图片数据（如果服务器支持）
    img.crossOrigin = "Anonymous";

    // 使用 Promise 包装图片加载过程
    const loadImage = new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = image.src;
    });

    await loadImage;

    // 2. 使用 Canvas 转换为 PNG 格式以获得最高兼容性
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // 3. 将 Canvas 内容转为 Blob
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );

    // 4. 写入剪贴板
    const data = [new ClipboardItem({ "image/png": blob })];
    await navigator.clipboard.write(data);

    // --- 成功反馈 ---
    copyBtn.classList.remove("copying");
    copyBtn.classList.add("success");
    copyBtn.innerHTML = '<i class="fas fa-check"></i> 图片已复制';

    showCopyNotification();
    setTimeout(
      () => resetCopyButton(copyBtn, originalText, originalClass),
      2000,
    );
  } catch (err) {
    console.error("Canvas 复制失败，尝试降级:", err);

    // --- 降级方案：如果 Canvas 失败（通常是严重的跨域限制），则尝试复制地址 ---
    try {
      await navigator.clipboard.writeText(image.src);
      copyBtn.innerHTML = '<i class="fas fa-link"></i> 已复制链接';
    } catch (e) {
      copyBtn.innerHTML = '<i class="fas fa-times"></i> 复制失败';
    }

    setTimeout(
      () => resetCopyButton(copyBtn, originalText, originalClass),
      2000,
    );
  }
}

// 辅助函数：重置按钮
function resetCopyButton(btn, originalText, originalClass) {
  btn.className = originalClass;
  btn.innerHTML = originalText;
  btn.disabled = false;
}

// 辅助函数：重置复制按钮状态
function resetCopyButton(btn, originalText, originalClass) {
  btn.className = originalClass;
  btn.innerHTML = originalText;
  btn.disabled = false;
}

// 删除当前图片
// 修改后的删除函数，支持自定义弹窗
async function deleteCurrentImage() {
  // 使用我们之前定义的 Modal.confirm 替代系统 confirm
  // 注意：必须加 await，否则代码会直接跳过确认向下执行
  const isConfirmed = await Modal.confirm(
    "确定要删除这张图片吗？此操作不可撤销。",
    "确认删除",
  );

  if (!isConfirmed) return;

  const cardIndex = contentItems.findIndex(
    (item) => item.id === currentViewingCardId,
  );

  if (cardIndex !== -1 && contentItems[cardIndex].images) {
    // 从数组中删除图片
    contentItems[cardIndex].images.splice(currentViewingImageIndex, 1);

    // 如果图片卡没有图片了，删除整个卡片
    if (contentItems[cardIndex].images.length === 0) {
      contentItems.splice(cardIndex, 1);
      // 重新排序
      contentItems.forEach((item, index) => {
        item.order = index + 1;
      });
    }

    // 重新渲染页面
    initPage();
    saveToLocalStorage();

    // 关闭查看器或更新查看器
    if (contentItems[cardIndex]?.images?.length > 0) {
      currentViewingImages = contentItems[cardIndex].images;
      if (currentViewingImageIndex >= currentViewingImages.length) {
        currentViewingImageIndex = currentViewingImages.length - 1;
      }
      updateViewerImage();
    } else {
      closeImageViewerModal();
    }

    // 显示删除成功通知
    setTimeout(() => {
      showCopyNotification();
      // 确保 copyNotification 元素存在
      const notifySpan = document.querySelector("#copyNotification span");
      if (notifySpan) notifySpan.textContent = "图片已删除！";
    }, 300);
  }
}
// ============ 需要在现有 index.js 中修改/添加的函数 ============

// ===== 需要修改 saveToLocalStorage() 函数 =====
/*
function saveToLocalStorage() {
  localStorage.setItem("contentSystemData", JSON.stringify(contentItems));
  localStorage.setItem("contentSystemNextItemId", nextItemId.toString());
  localStorage.setItem("contentSystemNextContentItemId", nextContentItemId.toString());
  // 添加下面这行：
  localStorage.setItem("contentSystemNextImageId", nextImageId.toString());
  // ... 其他保存代码
}
*/

// ===== 需要修改 renderContent() 函数 =====
/*
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
    } else if (item.type === "image-card") { // 添加这行
      renderImageCard(item); // 添加这行
    }
  });

  emptyState.style.display = "none";
}
*/

// ===== 需要修改 showContextMenu() 函数 =====
/*
function showContextMenu(e) {
  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.style.top = `${e.clientY}px`;

  if (contextMenuTarget) {
    editContextItem.style.display = "flex";
    addContextItem.style.display = "flex";
    deleteContextItem.style.display = "flex";

    // 修改这个条件判断
    if (
      contextMenuTarget.type === "content-card" ||
      contextMenuTarget.type === "main-title" ||
      contextMenuTarget.type === "subtitle" ||
      contextMenuTarget.type === "image-card"  // 添加这行
    ) {
      insertAfterContextItem.style.display = "flex";
      insertMainTitleAfterItem.style.display = "flex";
      insertSubtitleAfterItem.style.display = "flex";
      insertImagesAfterItem.style.display = "flex"; // 添加这行
      // 新增：编辑图片选项只在图片卡片上显示
      const editImagesItem = document.getElementById("editImagesItem");
      if (editImagesItem) {
        editImagesItem.style.display = contextMenuTarget.type === "image-card" ? "flex" : "none";
      }
    } else {
      insertAfterContextItem.style.display = "none";
      insertMainTitleAfterItem.style.display = "none";
      insertSubtitleAfterItem.style.display = "none";
      insertImagesAfterItem.style.display = "none"; // 添加这行
      // 隐藏编辑图片选项
      const editImagesItem = document.getElementById("editImagesItem");
      if (editImagesItem) {
        editImagesItem.style.display = "none";
      }
    }
  }

  contextMenu.classList.add("active");
}
*/

// ===== 需要修改 initializeApp() 函数 =====
/*
function initializeApp() {
  initBackgroundSelector();
  initOpacityControl();
  initImportExport();
  initPage();
  initAutoHideSettings();
  // 添加下面这行：
  initImageFunctions();
}
*/

// ===== 需要在导入导出相关函数中添加图片支持 =====
// 在 exportData() 和 importData() 函数中，确保处理了 nextImageId

// ============ 添加额外的CSS样式到index.css ============
/*
// 在 index.css 文件末尾添加：
.image-count-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  z-index: 2;
}

.preview-filename {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 3px;
  font-size: 0.6rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #aaa;
}

.image-empty-state i {
  font-size: 3rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

.image-card {
  background: linear-gradient(
    135deg,
    rgba(30, 30, 50, 0.8),
    rgba(40, 40, 70, 0.7),
    rgba(30, 30, 50, 0.8)
  );
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
  max-width: 100%;
  margin-left: 0;
  margin-right: auto;
}

body.light-mode .image-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9),
    rgba(245, 245, 245, 0.8),
    rgba(255, 255, 255, 0.9)
  );
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
*/

// 导出函数供其他文件使用
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initImageFunctions,
    renderImageCard,
    openAddImageModal,
    openEditImageModal,
    openImageViewer,
  };
}
