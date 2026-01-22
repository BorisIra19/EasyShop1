/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferrawdoctype" />
import { Model, Document } from 'mongoose';
export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export declare const paginate: <T extends Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}>>(model: Model<T, {}, {}, {}, import("mongoose").IfAny<T, any, Document<unknown, {}, T, {}, {}> & (import("mongoose").Require_id<T> extends infer T_1 ? T_1 extends import("mongoose").Require_id<T> ? T_1 extends {
    __v?: infer U | undefined;
} ? T_1 : T_1 & {
    __v: number;
} : never : never)>, any>, query?: any, page?: number, limit?: number, sort?: string) => Promise<PaginationResult<T>>;
//# sourceMappingURL=pagination.d.ts.map