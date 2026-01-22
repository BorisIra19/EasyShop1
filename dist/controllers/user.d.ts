import { Request, Response } from 'express';
import { IUser } from '../models/User';
interface AuthRequest extends Request {
    user?: IUser;
}
export declare const updateUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const uploadProfilePicture: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=user.d.ts.map