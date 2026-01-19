"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = void 0;
const paginate = async (model, query = {}, page = 1, limit = 10, sort = '-createdAt') => {
    const skip = (page - 1) * limit;
    const total = await model.countDocuments(query);
    const pages = Math.ceil(total / limit);
    const data = await model
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            pages,
        },
    };
};
exports.paginate = paginate;
//# sourceMappingURL=pagination.js.map