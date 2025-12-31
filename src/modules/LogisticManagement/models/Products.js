class Product {
    constructor() {
        

        this.products = [];
    }

    // Create product
    createProduct(product) {
        this.products.push(product);
        return product;
    }

    // Add product (alias / uso externo)
    addProduct(product) {
        return handlerCreateProduct.run(product);
    }

    // Update product
    updateProduct(productId, updatedData) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index === -1) {
            throw new Error("Product not found");
        }

        this.products[index] = {
            ...this.products[index],
            ...updatedData
        };

        return this.products[index];
    }
}