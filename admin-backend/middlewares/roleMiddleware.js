export const authorizateRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const role = req.user.role;

        if (!allowedRoles.includes(userRole)) return res.status(403).json({ message: 'Acceso denegado: no tienes permiso para realizar esta acción.' });

        next();
    };
};