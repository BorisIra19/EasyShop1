"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCustomer = exports.requireVendor = exports.requireAdmin = exports.requireRole = void 0;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)('admin');
exports.requireVendor = (0, exports.requireRole)('vendor', 'admin');
exports.requireCustomer = (0, exports.requireRole)('customer', 'vendor', 'admin');
//# sourceMappingURL=rbac.js.map