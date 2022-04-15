"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToSlug = void 0;
const stringToSlug = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
        .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
        .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
        .replace(/[íìỉĩị]/g, 'i')
        .replace(/[úùủũụưứừửữự]/g, 'u')
        .replace(/[ýỳỷỹỵ]/g, 'y')
        .replace(/[đ]/g, 'd')
        .replace(/[^a-z0-9- ]/g, '')
        .replace(/[ ]/g, '-')
        .replace(/[--]+/g, '-');
};
exports.stringToSlug = stringToSlug;
//# sourceMappingURL=IO.js.map