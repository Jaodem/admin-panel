import Client from '../models/Client.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Clientes
export const getClients = async (req, res) => {
    const clients = await Client.find();
    res.json(clients);
};

export const createClient = async (req, res) => {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
};

// Productos
export const getProducts = async (req, res) => {
    const products = await Product.find();
    res.json(products);
};

export const createProduct = async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
};

// Pedidos
export const getOrders = async (req, res) => {
    const orders = await Order.find().populate('client').populate('products.product');
    res.json(orders);
};

export const createOrder = async (req, res) => {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
};