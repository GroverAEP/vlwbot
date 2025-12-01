export default class Product {
    constructor({ sku, name, mark, category, price, dateAdded }) {
        this.sku = sku; // Código único
        this.name = name; // Nombre del producto
        this.mark = mark; // Marca
        this.category = category; // Categoría
        this.price = price; // Precio unitario
        this.dateAdded = dateAdded || new Date().toISOString(); // Fecha de creación
    }
}