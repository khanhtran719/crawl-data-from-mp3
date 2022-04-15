"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileExcel = void 0;
const xlsx_1 = require("xlsx");
// Reading our test file
// const file = readFile('./test.xlsx');
function readFileExcel(pathFile) {
    const file = (0, xlsx_1.readFile)(pathFile);
    const data = [];
    const sheets = file.SheetNames;
    for (let i = 0; i < sheets.length; i++) {
        const temp = xlsx_1.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
        temp.forEach((res) => {
            data.push(res);
        });
    }
    // Printing data
    return data;
}
exports.readFileExcel = readFileExcel;
//# sourceMappingURL=importData.js.map