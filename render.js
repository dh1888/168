// txt-parser.js - 完整版TXT解析器（包含span、h6、hh功能）

let nextTextId =
  parseInt(localStorage.getItem("contentSystemNextTextId")) || 2001;

// 完整解析函数
function parseTxtContent(txtContent) {
  const lines = txtContent.split("\n");
  const parsedItems = [];
  let currentCard = null;
  let currentContentItem = null;
  let inSpanSequence = false;
  let lastH6Item = null; // 新增：跟踪最近的h6项
  let currentH6Item = null; // 新增：当前处理的h6项

  // 清理文本
  function cleanText(text) {
    if (!text) return "";
    return text
      .replace(/<span>/gi, "")
      .replace(/<\/span>/gi, "")
      .replace(/^span\s+/i, "")
      .replace(/^span:/i, "")
      .trim();
  }

  // 判断是否是span行
  function isSpanLine(line) {
    const trimmed = line.trim().toLowerCase();
    return (
      trimmed.startsWith("span ") ||
      trimmed.startsWith("span:") ||
      trimmed.includes("<span") ||
      trimmed.includes("</span>")
    );
  }

  // 判断是否是h6行
  function isH6Line(line) {
    const trimmed = line.trim().toLowerCase();
    return (
      trimmed.startsWith("h6 ") ||
      trimmed.startsWith("h6:") ||
      trimmed.startsWith("###### ")
    );
  }

  // 判断是否是hh行（h6的子项）
  function isHhLine(line) {
    const trimmed = line.trim().toLowerCase();
    return trimmed.startsWith("hh ") || trimmed.startsWith("hh:");
  }

  // 判断是否是h5行
  function isH5Line(line) {
    const trimmed = line.trim().toLowerCase();
    return (
      trimmed.startsWith("h5 ") ||
      trimmed.startsWith("h5:") ||
      trimmed.startsWith("##### ")
    );
  }

  // 开始新卡片
  function startNewCard() {
    endCurrentCard();
    currentCard = {
      id: nextTextId++,
      type: "content-card",
      content: [],
      order: parsedItems.length + 1,
      parentId: null,
      createdAt: new Date().toISOString(),
    };
  }

  // 开始新内容项
  function startNewContentItem(line) {
    endCurrentContentItem();

    currentContentItem = {
      id: nextTextId++,
      type: "content",
      text: cleanText(line),
    };
  }

  // 添加到当前内容项
  function addToCurrentContentItem(line) {
    if (currentContentItem) {
      currentContentItem.text += "\n" + cleanText(line);
    } else {
      startNewContentItem(line);
    }
  }

  // 结束当前内容项
  function endCurrentContentItem() {
    if (currentContentItem && currentContentItem.text.trim().length > 0) {
      if (currentCard) {
        currentCard.content.push(currentContentItem);
      }
    }
    currentContentItem = null;
    inSpanSequence = false;
  }

  // 结束当前卡片
  function endCurrentCard() {
    endCurrentContentItem();

    if (currentCard && currentCard.content.length > 0) {
      parsedItems.push(currentCard);
      currentCard = null;
    }
  }

  // 处理标题
  function handleTitle(line, type) {
    endCurrentCard();
    // 清除之前的h6跟踪
    lastH6Item = null;
    currentH6Item = null;

    let text = cleanText(line);
    if (type === "main-title") {
      text = text.replace(/^#{3}\s*|^h3\s*|^【标题】\s*|^标题：\s*/i, "");
    } else {
      text = text.replace(
        /^#{4,5}\s*|^h[45]\s*|^【子标题】\s*|^子标题：\s*/i,
        "",
      );
    }

    if (text.trim().length > 0) {
      parsedItems.push({
        id: nextTextId++,
        type: type,
        text: text.trim(),
        order: parsedItems.length + 1,
        parentId: null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 处理h5（新增）
  function handleH5(line) {
    endCurrentCard();
    // 清除之前的h6跟踪
    lastH6Item = null;
    currentH6Item = null;

    let text = cleanText(line)
      .replace(/^h5\s*|^#####\s*/i, "")
      .trim();

    if (text.length > 0) {
      parsedItems.push({
        id: nextTextId++,
        type: "h5-title",
        text: text,
        order: parsedItems.length + 1,
        parentId: null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 处理h6（新增）
  function handleH6(line) {
    endCurrentCard();

    let text = cleanText(line)
      .replace(/^h6\s*|^######\s*/i, "")
      .trim();

    if (text.length > 0) {
      const h6Item = {
        id: nextTextId++,
        type: "h6-title",
        text: text,
        order: parsedItems.length + 1,
        parentId: null,
        createdAt: new Date().toISOString(),
        children: [], // 用于存储hh子项
      };

      parsedItems.push(h6Item);
      lastH6Item = h6Item; // 记录最近的h6
      currentH6Item = h6Item;
    }
  }

  // 处理hh（h6的子项）（新增）
  function handleHh(line) {
    // hh不需要结束当前卡片，它依附于h6
    let text = cleanText(line)
      .replace(/^hh\s*/i, "")
      .trim();

    if (text.length > 0 && lastH6Item) {
      const hhItem = {
        id: nextTextId++,
        type: "hh-item",
        text: text,
        order: lastH6Item.children.length + 1,
        parentId: lastH6Item.id,
        createdAt: new Date().toISOString(),
      };

      lastH6Item.children.push(hhItem);
    }
  }

  // 处理图片
  function handleImage(line) {
    endCurrentCard();
    // 清除之前的h6跟踪
    lastH6Item = null;
    currentH6Item = null;

    const imagePath = cleanText(line);
    const filename =
      imagePath.split("/").pop().split("?")[0] || `image_${Date.now()}`;

    parsedItems.push({
      id: nextTextId++,
      type: "image-card",
      images: [
        {
          id: nextTextId++,
          src: imagePath,
          filename: filename,
          uploadedAt: new Date().toISOString(),
        },
      ],
      order: parsedItems.length + 1,
      parentId: null,
      createdAt: new Date().toISOString(),
    });
  }

  // 主要解析逻辑
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 空行处理
    if (trimmedLine.length === 0) {
      endCurrentCard();
      currentH6Item = null; // 空行也清除当前h6
      continue;
    }

    // 检查标题（h3）
    if (trimmedLine.match(/^#{3}\s|^h3\s|^【标题】|^标题：/i)) {
      handleTitle(line, "main-title");
      continue;
    }

    // 检查小标题（h4）
    if (trimmedLine.match(/^#{4}\s|^h4\s|^【子标题】|^子标题：/i)) {
      handleTitle(line, "subtitle");
      continue;
    }

    // 检查h5（新增）
    if (isH5Line(line)) {
      handleH5(line);
      continue;
    }

    // 检查h6（新增）
    if (isH6Line(line)) {
      handleH6(line);
      continue;
    }

    // 检查hh（新增）
    if (isHhLine(line)) {
      handleHh(line);
      continue;
    }

    // 检查图片
    if (trimmedLine.match(/^\.\/|^http|\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
      handleImage(line);
      continue;
    }

    // 检查是否是span行
    const isSpan = isSpanLine(line);

    // 如果当前有h6项，结束它
    if (currentH6Item) {
      currentH6Item = null;
    }

    // 确保有当前卡片
    if (!currentCard) {
      startNewCard();
    }

    if (isSpan) {
      // span行：检查是否有当前内容项
      if (currentContentItem) {
        // 有内容项，span合并到其中
        addToCurrentContentItem(line);
        inSpanSequence = true;
      } else {
        // 没有内容项（不应该发生，但处理一下）
        startNewContentItem(line);
        inSpanSequence = true;
      }
    } else {
      // 非span行
      if (inSpanSequence) {
        // 之前在span序列中，现在结束了
        endCurrentContentItem();
        startNewContentItem(line);
      } else if (currentContentItem) {
        // 已经有内容项且不在span序列中，检查是否应该合并
        const prevLine = i > 0 ? lines[i - 1] : "";
        const prevIsSpan = isSpanLine(prevLine);

        if (prevIsSpan && prevLine.trim().length > 0) {
          // 上一行是span，当前行合并
          addToCurrentContentItem(line);
        } else {
          // 独立内容，开始新内容项
          endCurrentContentItem();
          startNewContentItem(line);
        }
      } else {
        // 没有当前内容项，开始新的
        startNewContentItem(line);
      }
    }

    // 检查下一行决定是否结束当前内容项
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    const nextTrimmed = nextLine.trim();
    const nextIsSpan = isSpanLine(nextLine);

    if (nextTrimmed.length === 0) {
      // 下一行是空行：内容项在endCurrentCard中处理
    } else if (!isSpan && !nextIsSpan) {
      // 当前和下一行都是非span普通行：结束当前内容项
      endCurrentContentItem();
    }
  }

  // 处理最后的内容
  endCurrentCard();

  // 统计信息
  const stats = {
    mainTitles: parsedItems.filter((item) => item.type === "main-title").length,
    subtitles: parsedItems.filter((item) => item.type === "subtitle").length,
    h5Titles: parsedItems.filter((item) => item.type === "h5-title").length,
    h6Titles: parsedItems.filter((item) => item.type === "h6-title").length,
    hhItems: parsedItems.reduce(
      (count, item) => count + (item.children ? item.children.length : 0),
      0,
    ),
    imageCards: parsedItems.filter((item) => item.type === "image-card").length,
    contentCards: parsedItems.filter((item) => item.type === "content-card")
      .length,
    contentItems: parsedItems.reduce(
      (count, item) => count + (item.content ? item.content.length : 0),
      0,
    ),
  };

  // 保存最新的ID
  localStorage.setItem("contentSystemNextTextId", nextTextId.toString());

  return parsedItems;
}

// 预览函数
function previewTxtFileComplete(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const txtContent = e.target.result;
        const lines = txtContent.split("\n");
        const parsedItems = parseTxtContent(txtContent);

        // 生成预览
        let previewText = "=== TXT文件完整解析预览 ===\n\n";

        previewText += "【解析规则】\n";
        previewText += "1. ### 或 h3 → 大标题（左侧导航）\n";
        previewText += "2. #### 或 h4 → 小标题\n";
        previewText += "3. ##### 或 h5 → h5标题\n";
        previewText += "4. ###### 或 h6 → h6标题\n";
        previewText += "5. hh → 作为h6的子项\n";
        previewText += "6. span → 合并到最近的内容项\n";
        previewText += "7. ./ 开头 → 图片卡片\n";
        previewText += "8. 普通文本+后续span → 同一内容项\n";
        previewText += "9. 空行 → 新卡片开始\n\n";

        previewText += `原始文件：${lines.length} 行，${txtContent.length} 字符\n\n`;

        // 统计信息
        const stats = {
          mainTitles: parsedItems.filter((item) => item.type === "main-title")
            .length,
          subtitles: parsedItems.filter((item) => item.type === "subtitle")
            .length,
          h5Titles: parsedItems.filter((item) => item.type === "h5-title")
            .length,
          h6Titles: parsedItems.filter((item) => item.type === "h6-title")
            .length,
          hhItems: parsedItems.reduce(
            (count, item) => count + (item.children ? item.children.length : 0),
            0,
          ),
          imageCards: parsedItems.filter((item) => item.type === "image-card")
            .length,
          contentCards: parsedItems.filter(
            (item) => item.type === "content-card",
          ).length,
          contentItems: parsedItems.reduce(
            (count, item) => count + (item.content ? item.content.length : 0),
            0,
          ),
        };

        previewText += "【统计信息】\n";
        previewText += `大标题(h3): ${stats.mainTitles}\n`;
        previewText += `小标题(h4): ${stats.subtitles}\n`;
        previewText += `h5标题: ${stats.h5Titles}\n`;
        previewText += `h6标题: ${stats.h6Titles}\n`;
        previewText += `hh子项: ${stats.hhItems}\n`;
        previewText += `图片卡片: ${stats.imageCards}\n`;
        previewText += `内容卡片: ${stats.contentCards}\n`;
        previewText += `内容项总数: ${stats.contentItems}\n`;
        previewText += `总计项目: ${parsedItems.length}\n\n`;

        // 显示目录
        if (stats.mainTitles > 0) {
          previewText += "【目录结构】\n";
          parsedItems
            .filter((item) => item.type === "main-title")
            .forEach((item, index) => {
              previewText += `${index + 1}. ${item.text}\n`;
            });
          previewText += "\n";
        }

        // 显示前几个项目的详细内容
        previewText += "【内容示例】\n";
        const sampleCount = Math.min(5, parsedItems.length);
        for (let i = 0; i < sampleCount; i++) {
          const item = parsedItems[i];
          previewText += `${i + 1}. [${item.type}] `;

          if (item.type === "main-title" || item.type === "subtitle") {
            previewText += `"${item.text}"\n`;
          } else if (item.type === "h5-title") {
            previewText += `(h5) "${item.text}"\n`;
          } else if (item.type === "h6-title") {
            previewText += `(h6) "${item.text}"\n`;
            if (item.children && item.children.length > 0) {
              previewText += `   包含 ${item.children.length} 个hh子项\n`;
            }
          } else if (item.type === "content-card") {
            const contentCount = item.content?.length || 0;
            previewText += `包含 ${contentCount} 个内容项\n`;
            if (contentCount > 0) {
              const firstContent = item.content[0];
              const lines = firstContent.text.split("\n");
              previewText += `  第一个内容项 (${lines.length} 行):\n`;
              lines.slice(0, 2).forEach((line, idx) => {
                previewText += `    ${idx + 1}. ${line.substring(0, 40)}${line.length > 40 ? "..." : ""}\n`;
              });
              if (lines.length > 2) {
                previewText += `    ... 还有 ${lines.length - 2} 行\n`;
              }
            }
          } else if (item.type === "image-card") {
            const imageCount = item.images?.length || 0;
            previewText += `包含 ${imageCount} 张图片\n`;
            if (imageCount > 0) {
              previewText += `  图片路径: ${item.images[0].src}\n`;
            }
          }
          previewText += "\n";
        }

        if (parsedItems.length > sampleCount) {
          previewText += `... 还有 ${parsedItems.length - sampleCount} 个项目\n`;
        }

        // 保存到预览区域
        const previewArea = document.getElementById("importPreview");
        if (previewArea) {
          previewArea.textContent = previewText;
          previewArea.dataset.parsedData = JSON.stringify({
            contentItems: parsedItems,
            parsedFromTxt: true,
            originalLineCount: lines.length,
            stats: stats,
          });
        }

        resolve({
          items: parsedItems,
          preview: previewText,
          stats: stats,
        });
      } catch (error) {
        console.error("预览失败:", error);
        const previewArea = document.getElementById("importPreview");
        if (previewArea) {
          previewArea.innerHTML = `<p style="color: #ff6666;">解析失败: ${error.message}</p>`;
        }
        reject(error);
      }
    };

    reader.onerror = function () {
      const previewArea = document.getElementById("importPreview");
      if (previewArea) {
        previewArea.innerHTML = `<p style="color: #ff6666;">文件读取失败</p>`;
      }
      reject(new Error("文件读取失败"));
    };

    reader.readAsText(file, "UTF-8");
  });
}

// 初始化
function initTxtImportFunctions() {
  // 更新界面提示
  const importFileArea = document.getElementById("importFileArea");
  if (importFileArea) {
    const paragraphs = importFileArea.querySelectorAll("p");
    if (paragraphs.length > 1) {
      paragraphs[1].textContent = "点击或拖放 JSON 或 TXT 文件到此处导入";
    }

    const fileTypes = importFileArea.querySelector(".file-types");
    if (fileTypes) {
      fileTypes.textContent = "支持 JSON 或 TXT 格式文件（完整解析）";
    }
  }

  // 更新文件输入
  const importFileInput = document.getElementById("importFileInput");
  if (importFileInput) {
    importFileInput.accept = ".json,.txt,.text";
  }
}

// 导出
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseTxtContent,
    previewTxtFileComplete,
    initTxtImportFunctions,
  };
}
