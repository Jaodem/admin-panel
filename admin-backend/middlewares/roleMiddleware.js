export const authorizateRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ message: 'No autenticado' });

    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: 'Acceso denegado: no tienes permiso para realizar esta acción.' });

    next();
};