## 如果有需要 Master-Detail 的簡單作法
> 假設搜索根據是ID

```javascript
// 引入延伸 js
import { openModal, createTabulatorTable, createTableFooter, reloadData, createModal, applyByteLimitToInputs } from "./tabulatorFooterExt.js";

/**
 * 變數
 */
let selectedRowToDelete = null; // 存儲要刪除的行
let selectedId = null; // 存儲當前選中的ID <================ 加入這個參數

// ********** 中間略，往下看子表格關鍵部份*******************

// 創建表格時，URL不用給，然後可以選擇加入placeholder提示文字
var tbB = createTabulatorTable(
    "tbB",
    "", // 先給空值
    [
        { title: "01", field: "ID" },
        { title: "02", field: "TEXT" }
    ],
    createTableFootertbB,
    {
        layout: "fitData",
        height: 750,
        placeholder: "請選擇左表ID載入資料！"
    }
);

// 把本來reloadData的程式換成這段，後端就是改為要接參數的程式了
function loadDatatbB() {
    if (!selectedId) {
        tbB.clearData(); // 清空資料
        return;
    }

    $.ajax({
        url: TBBUrl, // 這邊就是接收id值的後端程式碼
        type: "POST",
        data: { id: selectedId },
        success: function (response) {
            if (response.success) {
                tbB.setData(response.data); // 設定資料
            } else {
                tbB.clearData();
            }
        },
        error: function () {
            tbB.clearData();
            toastr.error('資料載入失敗');
        }
    });
}

/**
 * 然後再所有表格的最下面加入這段(確認表格都初始化完成才執行)
 */
tbA.on("rowClick", function (e, row) {
    selectedId = row.getData().ID; // 獲取選中的 ID
    loadDatatbB();
});
```
