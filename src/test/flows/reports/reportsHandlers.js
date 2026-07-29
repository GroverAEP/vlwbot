
export default class reportsHandlers extends BaseHandler {
    constructor(client) {
        super(client);
        this.name = "inventory";
        this.role = "owner";
         this.triggers = {
            inventory: ["inventory", "inventario"],
            sales: ["sales", "ventas"],
            lowstock: ["lowstock", "bajostock"],
            category: ["category", "categoria"],
            brand: ["brand", "marca"],
            summary: ["summary", "resumen"],
            export: ["export", "exportar"]
        };

        // this.inventoryService = new InventoryService();
    }

    async run({ msg, text }) {
        const action = ActionParser.detect(text, this.triggers);
        const words = text.split(" "); 
        const arg = words[1]; // argumento adicional (ej: SKU, categoría, marca)

        switch (action) {
            case "inventory":
                return this.inventoryReport(msg);

            case "sales":
                // Podrías enviar rango de fechas como argumentos
                return this.salesReport(msg, { startDate: words[1], endDate: words[2] });

            case "lowstock":
                return this.lowStockReport(msg, Number(arg) || 5);

            case "category":
                return this.categoryReport(msg, arg);

            case "brand":
                return this.brandReport(msg, arg);

            case "summary":
                return this.summaryReport(msg, arg || "daily");

            case "export":
                return this.exportReport(msg, arg || "json");

            default:
                return this.reply(msg, "⚠️ Acción no reconocida en REPORTES.");
        }
    }

// -------------------- MÉTODOS DE REPORTES --------------------

    // Reporte general de inventario
    async inventoryReport(msg) {
        // const products = await this.inventoryService.loadProducts();
        const products = await this.client.db.local.load("products")
        const totalProducts = products.length;
        const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

        let message = `📊 Inventario General\nTotal de productos: ${totalProducts}\nStock total: ${totalStock}\n\n`;

        products.forEach(p => {
            message += `- ${p.name} (${p.sku}): ${p.stock} unidades\n`;
        });

        return this.reply(msg, message);
    }

    // Reporte de ventas entre fechas
    async salesReport(msg, { startDate, endDate }) {
        const sales = await this.salesService.loadSales({ startDate, endDate });
        if (!sales.length) return this.reply(msg, "📉 No se encontraron ventas en ese periodo.");

        const totalSales = sales.reduce((acc, s) => acc + s.price * s.quantity, 0);

        let message = `💰 Reporte de Ventas\nPeriodo: ${startDate || 'inicio'} - ${endDate || 'hoy'}\nTotal: $${totalSales.toFixed(2)}\n\n`;
        sales.forEach(s => {
            message += `- ${s.productName} (${s.sku}): ${s.quantity} unidades - $${(s.price * s.quantity).toFixed(2)}\n`;
        });

        return this.reply(msg, message);
    }

    // Productos con bajo stock
    async lowStockReport(msg, threshold = 5) {
        const products = await this.inventoryService.loadProducts();
        const lowStockItems = products.filter(p => p.stock <= threshold);

        if (!lowStockItems.length) return this.reply(msg, "✅ No hay productos con bajo stock.");

        let message = `⚠️ Productos con bajo stock (≤${threshold} unidades):\n`;
        lowStockItems.forEach(p => {
            message += `- ${p.name} (${p.sku}): ${p.stock} unidades\n`;
        });

        return this.reply(msg, message);
    }

    // Productos por categoría
    async categoryReport(msg, category) {
        const products = await this.inventoryService.loadProducts();
        const filtered = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
        
        if (!filtered.length) return this.reply(msg, `⚠️ No se encontraron productos en la categoría "${category}".`);

        let message = `📂 Productos en categoría "${category}":\n`;
        filtered.forEach(p => message += `- ${p.name} (${p.sku}): ${p.stock} unidades\n`);

        return this.reply(msg, message);
    }

    // Productos por marca
    async brandReport(msg, brand) {
        const products = await this.inventoryService.loadProducts();
        const filtered = products.filter(p => p.mark.toLowerCase() === brand.toLowerCase());

        if (!filtered.length) return this.reply(msg, `⚠️ No se encontraron productos de la marca "${brand}".`);

        let message = `🏷 Productos de marca "${brand}":\n`;
        filtered.forEach(p => message += `- ${p.name} (${p.sku}): ${p.stock} unidades\n`);

        return this.reply(msg, message);
    }

    // Resumen diario, semanal o mensual
    async summaryReport(msg, period = "daily") {
        const sales = await this.salesService.loadSales();
        // Aquí podrías filtrar por period usando dateAdded o timestamp
        return this.reply(msg, `🗓 Resumen (${period}) aún no implementado.`);
    }

    // Exportar reporte a JSON o CSV
    async exportReport(msg, format = "json") {
        const products = await this.inventoryService.loadProducts();
        if (format === "json") {
            return this.reply(msg, `📁 Export JSON:\n${JSON.stringify(products, null, 2)}`);
        } else if (format === "csv") {
            const header = Object.keys(products[0]).join(",");
            const rows = products.map(p => Object.values(p).join(",")).join("\n");
            return this.reply(msg, `📁 Export CSV:\n${header}\n${rows}`);
        }
        return this.reply(msg, `⚠️ Formato "${format}" no soportado.`);
    }
}


export  class ActionParser {
    static detect(text, triggers) {
        const words = text.toLowerCase().split(" ");
        // Recorre cada acción y sus triggers
        for (const action in triggers) {
            const triggerList = triggers[action];

            for (const word of words) {
                if (triggerList.includes(word)) {
                    return action; // add, delete, update, sell, etc.
                }
            }
        }

        return null; // nada coincide
    }
}