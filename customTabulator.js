// 引用模組 js
import { openModal, createTabulatorTable, createTableFooter, reloadData, createModal } from "./tabulatorFooterExt.js";

/**
 * 變數
 */
let selectedRowToDelete = null; // 存儲要刪除的行

// 初始化表格
// 這邊需要寫指定的表格設定、AJAX url，以及給個id
var tbSample = createTabulatorTable(
    "tbSample",
    getTableDataUrl,
    [
        { title: "代號", field: "NO" },
        { title: "名稱", field: "NAME" }
    ],
    createTableFootertbSample,
    {
        layout: "fitData", 
        height: 700
    }
);

// 表格：按鈕組
function createTableFootertbSample() {
    return createTableFooter([
        { id: "btnAddtbSample", icon: "bi bi-file-earmark-plus", onClick: openAddModaltbSample },
        { id: "btnEdittbSample", icon: "bi bi-pencil-square", onClick: openEditModaltbSample },
        { id: "btnDeletetbSample", icon: "bi bi-trash3-fill", onClick: openDeleteConfirmtbSample },
        { id: "btnReloadtbSample", icon: "bi bi-arrow-clockwise", onClick: reloadDatatbSample }
    ]);
}

// 表格：重新整理
function reloadDatatbSample() {
    reloadData("tbSample", getTableDataUrl);
}

// 表格：創建新增 Modal
let modalAddtbSample = createModal(
    "modalAddtbSample",
    "新增資料",
    `
        <label>代號：</label>
        <input type="text" id="addNO" class="form-control">
        <label>名稱：</label>
        <input type="text" id="addNAME" class="form-control">
    `,
    "btnSaveAddtbSample",
    "新增"
);
document.body.appendChild(modalAddtbSample);

// 表格：創建編輯 Modal
let modalEdittbSample = createModal(
    "modalEdittbSample",
    "編輯",
    `
        <label>代號：</label>
        <input type="text" id="editNO" class="form-control" disabled>
        <label>名稱：</label>
        <input type="text" id="editNAME" class="form-control">
    `,
    "btnSaveEdittbSample",
    "儲存變更"
);
document.body.appendChild(modalEdittbSample);

// 表格：創建刪除確認 Modal
let modalDeleteConfirmtbSample = createModal(
    "modalDeleteConfirmtbSample",
    "刪除確認",
    `
        <p>確定要刪除這筆資料嗎？</p>
        <p><strong id="deleteInfotbSample" style="color:blue;"></strong></p>
    `,
    "btnConfirmDeletetbSample",
    "確定刪除"
);
document.body.appendChild(modalDeleteConfirmtbSample);


// 表格：【新增Modal】開啟畫面
function openAddModaltbSample() {
    openModal("modalAddtbSample");
}

// 表格：【編輯Modal】開啟畫面
function openEditModaltbSample() {
    let selectedRow = tbSample.getSelectedRows()[0];

    if (selectedRow) {
        let rowData = selectedRow.getData();
        $("#editNO").val(rowData.NO);
        $("#editNAME").val(rowData.NAME);
        openModal("modalEdittbSample");
    } else {
        toastr.warning('請選擇一筆資料進行編輯！', '提醒');
    }
}

// 表格：【刪除Modal】開啟畫面
function openDeleteConfirmtbSample() {
    let selectedRow = tbSample.getSelectedRows()[0];

    if (selectedRow) {
        selectedRowToDelete = selectedRow; // 暫存選取的行

        let rowData = selectedRow.getData();
        document.getElementById("deleteInfotbSample").innerText = `代號: ${rowData.NO}、名稱: ${rowData.NAME}`;

        openModal("modalDeleteConfirmtbSample"); // 顯示 Modal
    } else {
        toastr.warning('請選擇一筆資料進行刪除！', '提醒');
    }
}

// 表格：【新增功能】執行
document.getElementById("btnSaveAddtbSample").addEventListener("click", function () {
    let newData = {
        NO: $("#addNO").val().trim(),
        NAME: $("#addNAME").val().trim()
    };

    if (newData.NO && newData.NAME) {
        // 送資料到後端
        $.ajax({
            url: getAddDataUrl, // 請確認你的 API 路徑是否正確
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(newData),
            success: function (response) {
                if (response.success) {
                    toastr.success('資料新增成功');

                    // 1 秒後重新載入資料
                    setTimeout(function () {
                        reloadDatatbSample();
                    }, 1000);

                    $("#modalAddtbSample").modal("hide"); // 關閉 Modal
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

// 表格：【編輯功能】執行
document.getElementById("btnSaveEdittbSample").addEventListener("click", function () {
    let updatedData = {
        NO: $("#editNO").val(),
        NAME: $("#editNAME").val().trim()
    };

    let selectedRow = tbSample.getSelectedRows()[0];

    if (selectedRow) {
        $.ajax({
            url: getEditDataTUrl,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(updatedData),
            success: function (response) {
                if (response.success) {
                    toastr.success('資料更新成功');

                    // 1 秒後重新載入資料
                    setTimeout(function () {
                        reloadDatatbSample();
                    }, 1000);

                    $("#modalEdittbSample").modal("hide"); // 關閉 Modal
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

// 表格：【刪除功能】執行
document.getElementById("btnConfirmDeletetbSample").addEventListener("click", function () {
    if (!selectedRowToDelete) return;

    let rowData = selectedRowToDelete.getData(); // 取得要刪除的資料

    $.ajax({
        url: getDeleteDataUrl, // 請確認你的 API 路徑是否正確
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ NO: rowData.NO }),
        success: function (response) {
            if (response.success) {
                toastr.success('刪除成功');

                // 1 秒後重新載入資料
                setTimeout(function () {
                    reloadDatatbSample();
                }, 1000);

                $("#modalDeleteConfirmtbSample").modal("hide"); // 關閉 Modal
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
