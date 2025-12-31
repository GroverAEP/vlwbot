import { stat } from "fs";

export class MessageSellProducts {
    static default({ssc}) {

        let message_product = [];
        // console.log(!ssc || ssc.list_product.length === 0)
        // console.log(ssc.list_product.length === 0)
        if (ssc.list_product === undefined) {
            return `No hay productos para vender`;
        }

        if (!Array.isArray(ssc.list_product) || ssc.list_product.length === 0) {
            return "❌ No hay productos para mostrar";
        }

        for (const p of ssc.list_product) {
            const ms_p = `
                -------------------------
                Código: ${p.product.sku}
                Nombre: ${p.product.name}
                Cantidad: ${p.quantity}
                Precio unitario: ${p.product.unit_price}
                Subtotal: S/.${p.subtotal}
                -------------------------`;
            message_product.push(ms_p)
        }
    
        return `
        📦 Productos en venta:
            ${message_product};
            `;
    }


    static total({ssc}){
      return `💰 Precio total: ${ssc.total_amount}
            ¿Deseas confirmar la venta?
            Responde: SI / NO`  
    }

    
    static successSell(){
        return "Producto vendido exitosamente";
    }
}
