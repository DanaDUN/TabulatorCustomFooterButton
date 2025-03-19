/*
  變數
*/
let selectedRowToDelete = null; // 存儲要刪除的行

// **初始化表格**
var tbSample = new Tabulator("#tbSample", {
    layout: "fitData",
    height: 700,
    selectable: 1, // 允許選取 1 行
    footerElement: createTableFooter(), // 使用函式生成按鈕區域

    ajaxURL: getTableDataUrl,
    ajaxConfig: "POST",
    ajaxContentType: "json",

    columns: [
        { title: "代號", field: "NO" },
        { title: "名稱", field: "NAME" }
    ],

    ajaxResponse: function (url, params, response) {
        if (response && response.success && Array.isArray(response.data)) {
            return response.data;
        } else {
            return [];
        }
    }
});

// **確保 rowClick 事件可以正常觸發**
tbSample.on("rowClick", function (e, row) {
    tbSample.deselectRow(); // 取消其他行的選取，確保只選一行
    row.select(); // 手動選取行，確保 getSelectedRows() 可用
});

// **建立按鈕區域**
function createTableFooter() {
    let footer = document.createElement("div");
    footer.className = "custom-tb-footer"; // 添加指定的 class 名稱
    footer.style.borderTop = "1px solid #999"; // 設定 footer 上邊框
    footer.innerHTML = `
        <button id="btnAdd" class="btn text-dark px-1 py-1"><i class="bi bi-file-earmark-plus"></i></button>
        <button id="btnEdit" class="btn text-dark px-1 py-1"><i class="bi bi-pencil-square"></i></button>
        <button id="btnDelete" class="btn text-dark px-1 py-1"><i class="bi bi-trash3-fill"></i></button>
        <button id="btnReload" class="btn text-dark px-1 py-1"><i class="bi bi-arrow-clockwise"></i></button>
    `;

    // **綁定按鈕事件**
    setTimeout(() => {
        document.getElementById("btnAdd").addEventListener("click", openAddModal);
        document.getElementById("btnEdit").addEventListener("click", openEditModal);
        document.getElementById("btnDelete").addEventListener("click", openDeleteConfirm);
        document.getElementById("btnReload").addEventListener("click", reloadData);
    }, 100); // 確保 DOM 加載後綁定

    return footer;
}

// *開啟Modal(通用)
function openModal(modalId) {
    $("#" + modalId).modal("show");
}

// 【重新整理】載入Data
function reloadData() {
    $("#tbSample").fadeOut(30, function () {
        tbSample.replaceData(getTableDataUrl).then(function () {
            $("#tbSample").fadeIn(30);
        });
    });
}
// 【新增】開啟新增Modal
function openAddModal() {
    openModal("modalAdd");
}
// 【編輯】開啟編輯Modal
function openEditModal() {
    let selectedRow = tbSample.getSelectedRows()[0];

    if (selectedRow) {
        let rowData = selectedRow.getData();
        $("#editNO").val(rowData.NO);
        $("#editNAME").val(rowData.NAME);
        openModal("modalEdit");
    } else {
        toastr.warning('請選擇一筆資料進行編輯！', '提醒');
    }
}
// 【刪除】開啟刪除確認Modal
function openDeleteConfirm() {
    let selectedRow = tbSample.getSelectedRows()[0];

    if (selectedRow) {
        selectedRowToDelete = selectedRow; // 暫存選取的行

        let rowData = selectedRow.getData();
        document.getElementById("deleteInfo").innerText = `代號: ${rowData.NO}，名稱: ${rowData.NAME}`;

        openModal("modalDeleteConfirm"); // 顯示 Modal
    } else {
        toastr.warning('請選擇一筆資料進行刪除！', '提醒');
    }
}

// 【刪除】按下確認刪除後執行刪除
document.getElementById("btnConfirmDelete").addEventListener("click", function () {
    if (!selectedRowToDelete) return;

    let rowData = selectedRowToDelete.getData(); // 取得要刪除的資料

    $.ajax({
        url: getDeleteDataUrl,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ NO: rowData.NO }),
        success: function (response) {
            if (response.success) {
                toastr.success('刪除成功');

                // 1 秒後重新載入資料
                setTimeout(function () {
                    reloadData();
                }, 1000);

                $("#modalDeleteConfirm").modal("hide"); // 關閉 Modal
                selectedRowToDelete = null; // 清空暫存變數
            } else {
                toastr.error(response.message || '刪除失敗');
            }
        },
        error: function () {
            toastr.error('刪除失敗，請稍後再試');
        }
    });

});

// 【新增】按下儲存按鈕時，將資料加到 Tabulator 表格
document.getElementById("btnSaveAdd").addEventListener("click", function () {
    let newData = {
        NO: $("#addNO").val().trim(),
        NAME: $("#addNAME").val().trim()
    };

    if (newData.NO && newData.NAME) {
        // 送資料到後端
        $.ajax({
            url: getAddDataUrl,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(newData),
            success: function (response) {
                if (response.success) {
                    toastr.success('資料新增成功');

                    // 1 秒後重新載入資料
                    setTimeout(function () {
                        reloadData();
                    }, 1000);

                    $("#modalAdd").modal("hide"); // 關閉 Modal
                    $("#addNO, #addNAME").val(""); // 清空輸入欄位
                } else {
                    toastr.error(response.message || '資料新增失敗');
                }
            },
            error: function () {
                toastr.error('資料新增失敗，請稍後再試');
            }
        });
    } else {
        toastr.warning('請填寫完整資料！', '提醒');
    }
});

// 【編輯】按下儲存後變更資料
document.getElementById("btnSaveEdit").addEventListener("click", function () {
    let updatedData = {
        NO: $("#editNO").val(),
        NAME: $("#editNAME").val().trim()
    };

    let selectedRow = tbSample.getSelectedRows()[0];

    if (selectedRow) {
        $.ajax({
            url: getEditDataUrl,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(updatedData),
            success: function (response) {
                if (response.success) {
                    toastr.success('資料更新成功');

                    // 1 秒後重新載入資料
                    setTimeout(function () {
                        reloadData();
                    }, 1000);

                    $("#modalEdit").modal("hide"); // 關閉 Modal
                } else {
                    toastr.error(response.message || '資料更新失敗');
                }
            },
            error: function () {
                toastr.error('資料更新失敗，請稍後再試');
            }
        });
    } else {
        toastr.warning('請選擇一筆資料進行編輯！', '提醒');
    }

});
