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
  if (!addImagesBtn || !imageModal) {
    console.error("图片功能所需的DOM元素未找到，请确保HTML已正确更新");
    return;
  }

  if (imageViewerModal?.dataset.viewerBound === "true") {
    return;
  }
  if (imageViewerModal) {
    imageViewerModal.dataset.viewerBound = "true";
  }

  const stopViewerClose = (handler) => (event) => {
    event.stopPropagation();
    handler(event);
  };

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
  closeImageViewer.addEventListener("click", stopViewerClose(closeImageViewerModal));
  prevImageBtn.addEventListener("click", stopViewerClose(showPrevImage));
  nextImageBtn.addEventListener("click", stopViewerClose(showNextImage));
  downloadImageBtn.addEventListener("click", stopViewerClose(downloadCurrentImage));
  copyImageUrlBtn.addEventListener("click", stopViewerClose(copyImage));
  deleteImageBtn.addEventListener("click", stopViewerClose(deleteCurrentImage));

  const headerCopyImageBtn = document.getElementById("headerCopyImageBtn");
  if (headerCopyImageBtn) {
    headerCopyImageBtn.addEventListener("click", stopViewerClose(copyImage));
  }

  const headerDownloadImageBtn = document.getElementById("headerDownloadImageBtn");
  if (headerDownloadImageBtn) {
    headerDownloadImageBtn.addEventListener("click", stopViewerClose(downloadCurrentImage));
  }

  const headerDeleteImageBtn = document.getElementById("headerDeleteImageBtn");
  if (headerDeleteImageBtn) {
    headerDeleteImageBtn.addEventListener("click", stopViewerClose(deleteCurrentImage));
  }

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
    // 仅点击遮罩空白区域时关闭（避免误触顶部/底部按钮）
    if (e.target !== imageViewerModal) {
      return;
    }

    closeImageViewerModal();
  });

  // 编辑图片菜单项已在上方绑定，无需重复注册

  initImageTitleEditing();
}

// ============ 图片标题编辑 ============

function formatImageDisplayName(filename, maxLength = 20) {
  const name = filename?.trim() || "未命名";
  if (name.length <= maxLength) return name;
  return `${name.substring(0, maxLength - 3)}...`;
}

function findImageEntry(cardId, imageId, imageIndex = -1) {
  const card = contentItems.find((item) => item.id === cardId);
  if (!card?.images?.length) return null;

  let image = card.images.find((img) => img.id === imageId);
  if (!image && imageIndex >= 0) {
    image = card.images[imageIndex];
  }
  if (!image) return null;

  if (!image.id) {
    image.id = nextImageId++;
  }

  return { card, image };
}

function updateImageFilename(cardId, imageId, newFilename, imageIndex = -1) {
  const trimmed = newFilename.trim();
  if (!trimmed) return false;

  const entry = findImageEntry(cardId, imageId, imageIndex);
  if (!entry) return false;

  entry.image.filename = trimmed;
  saveToLocalStorage();
  return true;
}

function beginInlineImageTitleEdit(
  imageItem,
  cardId,
  imageId,
  currentFilename,
  imageIndex = -1,
) {
  if (!imageItem || imageItem.querySelector(".image-title-input")) return;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "image-title-input";
  input.value = currentFilename || "";
  input.maxLength = 120;
  input.placeholder = "输入图片标题";

  const overlay = imageItem.querySelector(".image-item-overlay");
  if (overlay) overlay.style.opacity = "1";

  imageItem.appendChild(input);
  input.focus();
  input.select();

  input.addEventListener("click", (e) => e.stopPropagation());
  input.addEventListener("mousedown", (e) => e.stopPropagation());

  const cancelEdit = () => {
    input.remove();
    refreshContent();
  };

  const commitEdit = () => {
    const nextName = input.value.trim();
    if (!nextName) {
      if (typeof Modal !== "undefined") {
        Modal.alert("标题不能为空", "提示");
      } else {
        alert("标题不能为空");
      }
      input.focus();
      return;
    }

    if (updateImageFilename(cardId, imageId, nextName, imageIndex)) {
      refreshContent();
      if (typeof showCopyNotification === "function") {
        showCopyNotification("标题已更新", "content-copied");
      }
    }
  };

  input.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  });

  input.addEventListener("blur", commitEdit);
}

function beginViewerImageTitleEdit() {
  if (!currentViewingCardId || currentViewingImages.length === 0) return;

  const image = currentViewingImages[currentViewingImageIndex];
  const titleBar = document.getElementById("viewerImageTitleBar");
  const titleText = document.getElementById("viewerImageTitleText");
  const editBtn = document.getElementById("editImageTitleBtn");
  if (!titleBar || !titleText || !image) return;

  if (titleBar.querySelector(".viewer-image-title-input")) return;

  titleText.style.display = "none";
  if (editBtn) editBtn.style.display = "none";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "viewer-image-title-input";
  input.value = image.filename || "";
  input.maxLength = 120;
  input.placeholder = "输入图片标题";
  titleBar.insertBefore(input, editBtn);

  input.focus();
  input.select();

  const restoreViewerTitle = () => {
    input.remove();
    titleText.style.display = "";
    if (editBtn) editBtn.style.display = "";
    updateViewerImage();
  };

  const commitEdit = () => {
    const nextName = input.value.trim();
    if (!nextName) {
      if (typeof Modal !== "undefined") {
        Modal.alert("标题不能为空", "提示");
      } else {
        alert("标题不能为空");
      }
      input.focus();
      return;
    }

    if (updateImageFilename(currentViewingCardId, image.id, nextName)) {
      restoreViewerTitle();
      refreshContent();
      if (typeof showCopyNotification === "function") {
        showCopyNotification("标题已更新", "content-copied");
      }
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      restoreViewerTitle();
    }
  });

  input.addEventListener("blur", commitEdit);
}

function initImageTitleEditing() {
  if (!contentContainer || contentContainer.dataset.imageTitleBound) return;
  contentContainer.dataset.imageTitleBound = "true";

  contentContainer.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".image-title-edit-btn");
    if (!editBtn) return;

    e.stopPropagation();
    e.preventDefault();

    const imageItem = editBtn.closest(".image-item");
    if (!imageItem) return;

    const cardId = parseInt(imageItem.dataset.cardId, 10);
    const imageId = parseInt(imageItem.dataset.imageId, 10);
    const imageIndex = parseInt(imageItem.dataset.index, 10);
    const card = contentItems.find((item) => item.id === cardId);
    const image =
      card?.images?.find((img) => img.id === imageId) ||
      card?.images?.[imageIndex];

    beginInlineImageTitleEdit(
      imageItem,
      cardId,
      imageId,
      image?.filename || "",
      imageIndex,
    );
  });

  contentContainer.addEventListener("dblclick", (e) => {
    const overlayText = e.target.closest(".image-item-overlay-text");
    const overlay = e.target.closest(".image-item-overlay");
    if (!overlayText && !overlay) return;

    e.stopPropagation();
    e.preventDefault();

    const imageItem = (overlayText || overlay).closest(".image-item");
    if (!imageItem) return;

    const cardId = parseInt(imageItem.dataset.cardId, 10);
    const imageId = parseInt(imageItem.dataset.imageId, 10);
    const imageIndex = parseInt(imageItem.dataset.index, 10);
    const card = contentItems.find((item) => item.id === cardId);
    const image =
      card?.images?.find((img) => img.id === imageId) ||
      card?.images?.[imageIndex];

    beginInlineImageTitleEdit(
      imageItem,
      cardId,
      imageId,
      image?.filename || "",
      imageIndex,
    );
  });

  const editImageTitleBtn = document.getElementById("editImageTitleBtn");
  const viewerImageTitleText = document.getElementById("viewerImageTitleText");

  if (editImageTitleBtn) {
    editImageTitleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      beginViewerImageTitleEdit();
    });
  }

  if (viewerImageTitleText) {
    viewerImageTitleText.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      beginViewerImageTitleEdit();
    });
  }
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
  refreshContent();
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
function renderImageCard(item, target = contentContainer) {
  const imageCard = document.createElement("div");
  imageCard.className = "image-card";
  imageCard.id = `card-${item.id}`;
  imageCard.dataset.id = item.id;
  imageCard.dataset.type = "image-card";

  const imageGrid = document.createElement("div");
  imageGrid.className = "image-grid";

  if (item.images && item.images.length > 0) {
    item.images.forEach((image, index) => {
      const imageItem = document.createElement("div");
      imageItem.className = "image-item";
      imageItem.dataset.index = index;
      imageItem.dataset.cardId = item.id;
      imageItem.dataset.imageId = image.id ?? index;
      imageItem.title = "点击查看 · 双击标题可修改";

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

      const textSpan = document.createElement("span");
      textSpan.className = "image-item-overlay-text";
      textSpan.textContent = formatImageDisplayName(
        image.filename || `图片 ${index + 1}`,
      );
      textSpan.title = image.filename || `图片 ${index + 1}`;

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "image-title-edit-btn";
      editBtn.title = "修改标题";
      editBtn.setAttribute("aria-label", "修改标题");
      editBtn.innerHTML = '<i class="fas fa-pen"></i>';

      overlay.appendChild(textSpan);
      overlay.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "image-item-delete-btn";
      deleteBtn.title = "删除图片";
      deleteBtn.setAttribute("aria-label", "删除图片");
      deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';

      imageItem.appendChild(img);
      imageItem.appendChild(overlay);
      imageItem.appendChild(deleteBtn);
      imageGrid.appendChild(imageItem);
    });
  } else {
    const emptyImageState = document.createElement("div");
    emptyImageState.className = "image-empty-state";
    emptyImageState.innerHTML = '<i class="fas fa-image"></i><p>暂无图片</p>';
    imageGrid.appendChild(emptyImageState);
  }

  imageCard.appendChild(imageGrid);
  target.appendChild(imageCard);
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

  const titleText = document.getElementById("viewerImageTitleText");
  if (titleText) {
    const fullName = image.filename || `图片 ${currentViewingImageIndex + 1}`;
    titleText.textContent = fullName;
    titleText.title = `${fullName}（双击修改）`;
  }

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
async function copyImageDataToClipboard(image) {
  if (!image?.src) {
    throw new Error("无效图片");
  }

  const img = new Image();
  img.crossOrigin = "Anonymous";

  await new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = image.src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );

  if (!blob) {
    throw new Error("图片转换失败");
  }

  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob }),
  ]);
}

function getContextMenuImage() {
  if (!contextMenuTarget) return null;

  const { type, id, cardId, imageId, imageIndex } = contextMenuTarget;

  if (type === "image-item") {
    const card = contentItems.find((item) => item.id === cardId || item.id === id);
    if (!card?.images?.length) return null;
    return (
      card.images.find((img) => img.id === imageId) ||
      card.images[imageIndex] ||
      null
    );
  }

  if (type === "image-card") {
    const card = contentItems.find((item) => item.id === id);
    return card?.images?.[0] || null;
  }

  return null;
}

async function copyImageFromContextMenu() {
  const image = getContextMenuImage();
  if (!image) {
    if (typeof Modal !== "undefined") {
      await Modal.alert("未找到可复制的图片", "提示");
    }
    return;
  }

  try {
    await copyImageDataToClipboard(image);
    if (typeof showCopyNotification === "function") {
      showCopyNotification("图片已复制", "image-copied");
    }
  } catch (err) {
    console.error("复制图片失败:", err);
    try {
      await navigator.clipboard.writeText(image.src);
      if (typeof showCopyNotification === "function") {
        showCopyNotification("已复制图片链接", "image-copied");
      }
    } catch (e) {
      if (typeof Modal !== "undefined") {
        await Modal.alert("复制失败，请检查浏览器权限或图片跨域设置", "复制失败");
      } else {
        alert("复制失败");
      }
    }
  }
}

async function copyImage(event) {
  const image = currentViewingImages[currentViewingImageIndex];
  const headerCopyBtn = document.getElementById("headerCopyImageBtn");
  const copyButtons = [copyImageUrlBtn, headerCopyBtn].filter(Boolean);

  const originals = copyButtons.map((btn) => ({
    btn,
    html: btn.innerHTML,
    className: btn.className,
  }));

  const copyButtonHtml = {
    loading: {
      footer:
        '<i class="fas fa-spinner fa-spin"></i><span class="viewer-btn-label">正在处理图片...</span>',
      header:
        '<i class="fas fa-spinner fa-spin"></i><span class="viewer-header-btn-label">复制</span>',
    },
    success: {
      footer:
        '<i class="fas fa-check"></i><span class="viewer-btn-label">图片已复制</span>',
      header:
        '<i class="fas fa-check"></i><span class="viewer-header-btn-label">已复制</span>',
    },
    link: {
      footer:
        '<i class="fas fa-link"></i><span class="viewer-btn-label">已复制链接</span>',
      header:
        '<i class="fas fa-link"></i><span class="viewer-header-btn-label">链接</span>',
    },
    fail: {
      footer:
        '<i class="fas fa-times"></i><span class="viewer-btn-label">复制失败</span>',
      header:
        '<i class="fas fa-times"></i><span class="viewer-header-btn-label">失败</span>',
    },
  };

  const setAllCopyButtons = (state, extraClass) => {
    copyButtons.forEach((btn) => {
      btn.disabled = true;
      btn.classList.remove("copying", "success");
      if (extraClass) btn.classList.add(extraClass);
      const kind = btn.id === "headerCopyImageBtn" ? "header" : "footer";
      btn.innerHTML = copyButtonHtml[state][kind];
    });
  };

  const restoreAllCopyButtons = () => {
    originals.forEach(({ btn, html, className }) => {
      resetCopyButton(btn, html, className);
    });
  };

  setAllCopyButtons("loading", "copying");

  try {
    await copyImageDataToClipboard(image);
    setAllCopyButtons("success", "success");
    showCopyNotification("图片已复制", "image-copied");
    restoreAllCopyButtons();
    closeImageViewerModal();
  } catch (err) {
    console.error("Canvas 复制失败，尝试降级:", err);

    try {
      await navigator.clipboard.writeText(image.src);
      setAllCopyButtons("link");
      showCopyNotification("已复制图片链接", "image-copied");
      restoreAllCopyButtons();
      closeImageViewerModal();
    } catch (e) {
      setAllCopyButtons("fail");
      setTimeout(restoreAllCopyButtons, 2000);
    }
  }
}

// 辅助函数：重置按钮
function resetCopyButton(btn, originalText, originalClass) {
  btn.className = originalClass;
  btn.innerHTML = originalText;
  btn.disabled = false;
}

// 删除指定卡片中的图片
async function removeImageAt(cardId, imageIndex) {
  const isConfirmed = await Modal.confirm(
    "确定要删除这张图片吗？此操作不可撤销。",
    "确认删除",
  );
  if (!isConfirmed) return false;

  const cardIndex = contentItems.findIndex((item) => item.id === cardId);
  if (cardIndex === -1 || !contentItems[cardIndex].images) return false;

  contentItems[cardIndex].images.splice(imageIndex, 1);

  if (contentItems[cardIndex].images.length === 0) {
    contentItems.splice(cardIndex, 1);
    contentItems.forEach((item, index) => {
      item.order = index + 1;
    });
  }

  refreshContent();
  saveToLocalStorage();
  return true;
}

function notifyImageDeleted() {
  setTimeout(() => {
    showCopyNotification();
    const notifySpan = document.querySelector("#copyNotification span");
    if (notifySpan) notifySpan.textContent = "图片已删除！";
  }, 300);
}

async function deleteImageFromThumbnail(cardId, imageIndex) {
  const viewerWasOpen = imageViewerModal.classList.contains("active");
  const viewingSameCard = viewerWasOpen && currentViewingCardId === cardId;
  let nextViewIndex = currentViewingImageIndex;

  if (viewingSameCard && imageIndex < currentViewingImageIndex) {
    nextViewIndex = currentViewingImageIndex - 1;
  }

  const removed = await removeImageAt(cardId, imageIndex);
  if (!removed) return;

  if (!viewerWasOpen) {
    notifyImageDeleted();
    return;
  }

  const card = contentItems.find((item) => item.id === cardId);
  if (card?.images?.length) {
    currentViewingImages = card.images;
    if (viewingSameCard) {
      currentViewingImageIndex = Math.min(
        nextViewIndex,
        currentViewingImages.length - 1,
      );
      updateViewerImage();
    }
  } else {
    closeImageViewerModal();
  }

  notifyImageDeleted();
}

// 删除当前图片
async function deleteCurrentImage() {
  const removed = await removeImageAt(
    currentViewingCardId,
    currentViewingImageIndex,
  );
  if (!removed) return;

  const card = contentItems.find((item) => item.id === currentViewingCardId);
  if (card?.images?.length) {
    currentViewingImages = card.images;
    if (currentViewingImageIndex >= currentViewingImages.length) {
      currentViewingImageIndex = currentViewingImages.length - 1;
    }
    updateViewerImage();
  } else {
    closeImageViewerModal();
  }

  notifyImageDeleted();
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
