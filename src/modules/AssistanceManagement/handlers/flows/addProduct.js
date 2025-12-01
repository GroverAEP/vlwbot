// usecases/AddProductUseCase.js
export default class AddProductUseCase {
    constructor(productsManager) {
        this.productsManager = productsManager; // inyecta dependencia
    }

    async execute({ name, mark, category, price }) {
        // Validaciones
        if (!name || !mark || !category || price <= 0) {
            throw new Error("Datos inválidos");
        }

        // Genera SKU
        const sku = (name.slice(0,3) + mark.slice(0,3) + category.slice(0,3) + Date.now()).toUpperCase();

        // Crea producto usando manager
        return this.productsManager.create({ sku, name, mark, category, price });
    }
}
