/// <reference types="multer" />
import { Request, Response } from 'express';
import { IUser } from '../models/User';
interface AuthRequest extends Request {
    user?: IUser;
    files?: Express.Multer.File[];
}
export declare const getProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProduct: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteProduct: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadProductImages: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteProductImage: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProductStats: (req: Request, res: Response) => Promise<void>;
export declare const getTopProducts: (req: Request, res: Response) => Promise<void>;
export declare const getLowStockProducts: (req: Request, res: Response) => Promise<void>;
export declare const getPriceDistribution: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=product.d.ts.map