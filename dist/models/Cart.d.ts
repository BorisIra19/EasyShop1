import mongoose from 'mongoose';
export interface ICartItem {
    _id: string;
    productId: string;
    quantity: number;
}
export interface ICart {
    _id: string;
    userId: string;
    items: ICartItem[];
}
declare const _default: mongoose.Model<ICart, {}, {}, {}, mongoose.Document<unknown, {}, ICart, {}, {}> & ICart & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Cart.d.ts.map