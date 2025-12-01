export default class Sale {
    constructor({ saleId, sku, productName, quantity, price, total, dateSold }) {
        this.saleId = saleId; // ID único de venta
        this.sku = sku; // SKU del producto vendido
        this.productName = productName; // Nombre del producto
        this.quantity = quantity; // Cantidad vendida
        this.price = price; // Precio unitario al momento de la venta
        this.total = total || (price * quantity); // Total de la venta
        this.dateSold = dateSold || new Date().toISOString(); // Fecha de la venta
    }
}