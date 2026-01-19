import mongoose from 'mongoose';
export interface IProduct {
    _id: string;
    name: string;
    price: number;
    description?: string;
    categoryId: string;
    inStock: boolean;
    quantity: number;
    vendorId: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Product.d.ts.map