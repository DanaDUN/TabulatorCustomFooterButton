/**
 * 自製 Footer 延伸工具組，給 Tabulator 使用
 */


// 用於保存表格實例的全局變量
const tableInstances = {};

// 開啟 Modal
export function openModal(modalId) {
    $("#" + modalId).modal("show");
}


// 表格初始化
export function createTabulatorTable(tableId, ajaxURL, columns, footerElementCreator, options = {}) {
    // 預設選項
    const defaultOptions = {
        selectable: 1, // 允許選取 1 行
        footerElement: footerElementCreator(), // 使用函式生成按鈕區域

        ajaxURL: ajaxURL,
        ajaxConfig: "POST",
        ajaxContentType: "json",

        columns: columns,

        ajaxResponse: function (url, params, response) {
            if (response && response.success && Array.isArray(response.data)) {
                return response.data;
            } else {
                return [];
            }
        }
    };

    // 合併傳入的選項與預設選項
    const tableOptions = { ...defaultOptions, ...options };

    // 初始化 Tabulator 表格
    const table = new Tabulator("#" + tableId, tableOptions);

    // 保存表格實例
    tableInstances[tableId] = table;

    // **確保 rowClick 事件可以正常觸發**
    table.on("rowClick", function (e, row) {
        table.deselectRow(); // 取消其他行的選取，確保只選一行
        row.select(); // 手動選取行，確保 getSelectedRows() 可用
    });

    return table;
}


// 建立 footer 按鈕區域
export function createTableFooter(buttonConfigs) {
    const footer = document.createElement("div");
    footer.className = "custom-tb-footer"; // 添加指定的 class 名稱
    footer.style.borderTop = "1px solid #999"; // 設定上邊框

    // 生成按鈕 HTML
    footer.innerHTML = buttonConfigs.map(config => `
        <button id="${config.id}" class="btn text-dark px-1 py-1"><i class="${config.icon}"></i></button>
    `).join('');

    // **綁定按鈕事件**
    setTimeout(() => {
        buttonConfigs.forEach(config => {
            document.getElementById(config.id).addEventListener("click", config.onClick);
        });
    }, 100); // 確保 DOM 加載後綁定

    return footer;
}


// 重新整理 Data
export function reloadData(tableId, dataUrl) {
    $("#" + tableId).fadeOut(30, function () {
        const table = tableInstances[tableId];
        table.replaceData(dataUrl).then(function () {
            $("#" + tableId).fadeIn(30);
        });
    });
}


// 通用的建立 Modal 函式
export function createModal(modalId, modalTitle, bodyContent, saveButtonId, saveButtonText) {
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = modalId;
    modal.tabIndex = -1;
    modal.setAttribute("aria-labelledby", modalId + "Label");
    modal.setAttribute("aria-hidden", "true");

    const modalDialog = document.createElement("div");
    modalDialog.className = "modal-dialog modal-dialog-centered";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    modalHeader.innerHTML = `
        <h5 class="modal-title" id="${modalId}Label">${modalTitle}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    `;

    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";
    modalBody.innerHTML = bodyContent;

    const modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer";
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-primary" id="${saveButtonId}">${saveButtonText}</button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
    `;

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);

    return modal;
}


// #region input 長度限制
export function truncateByByte(str, maxBytes) {
    let total = 0;
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const char = str[i];                                    // 取得當前字元
        const charByte = char.charCodeAt(0) > 255 ? 2 : 1;      // 判斷字元的位元組大小
        if (total + charByte > maxBytes) break;                 // 超過限制則停止
        result += char;                                         // 累加字元
        total += charByte;                                      // 累加位元組大小
    }
    return result;
}

export function applyByteLimitToInputs() {
    document.querySelectorAll('input[data-byte-limit]').forEach(input => {  // 選取所有有 data-byte-limit 屬性的 input 元素
        input.addEventListener('input', function () {                       // 綁定 input 事件
            const maxBytes = parseInt(this.dataset.byteLimit, 10);          // 取得最大位元組數
            const trimmed = truncateByByte(this.value, maxBytes);           // 截斷字串
            if (this.value !== trimmed) {                                   // 如果值有變更
                this.value = trimmed;                                       // 更新 input 值
            }
        });
    });
}
// #endregion 

