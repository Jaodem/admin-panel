import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorizateRoles } from '../middlewares/roleMiddleware.js';
import { getClients, createClient, getProducts, createProduct, getOrders, createOrder } from '../controllers/adminController.js';

const router = express.Router();

// Clientes
router.get('/clients', verifyToken, authorizateRoles('admin'), getClients);
router.post('/clients', verifyToken, authorizateRoles('admin'), createClient);

// Productos
router.get('/products', verifyToken, authorizateRoles('admin'), getProducts);
router.post('/products', verifyToken, authorizateRoles('admin'), createProduct);

// Pedidos
router.get('/orders', verifyToken, authorizateRoles('admin'), getOrders);
router.post('/orders', verifyToken, authorizateRoles('admin'), createOrder);

export default router;