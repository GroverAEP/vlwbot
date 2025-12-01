import Product from './product.js';

export default class InventoryItem {
    constructor({ product, stock = 0, location = "Almacén", minStock = 5, lastUpdated }) {
        this.product = product instanceof Product ? product : new Product(product);
        this.stock = stock; // Cantidad disponible
        this.location = location; // Ubicación del producto
        this.minStock = minStock; // Umbral para alerta de bajo stock
        this.lastUpdated = lastUpdated || new Date().toISOString(); // Fecha de última actualización
    }
}