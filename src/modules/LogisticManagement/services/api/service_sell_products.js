import { ServiceSearchProduct } from "../api/service_search_product.js";

export async function ServiceSellProducts({data,}){
    let {pool,info} = data;
    
    const listProducts =  info.listProducts;
    
    // Este servicio funciona con el inventario
    //
    // info : {codigo: sku, cantidad: stock}| |
    
    // [
    //     {sku: sku, stock: 1},
    //     {sku: sku, stock: 4},
    //     {sku: sku, stock: 6}
    // ]

    try{
        await client.query('BEGIN');
        for (const product of listProducts){
            const { sku, quantity } = product;
    
            //Este metodo es para encontrar la ID del producto atravez del  sku
            const searchProduct = await ServiceSearchProduct({
                pool:pool,
                sku
            });
            
            
            if (!searchProduct) {
                throw new Error(`Producto ${sku} no existe`);
            }
    
            if (product.stock < quantity) {
                throw new Error(`Stock insuficiente para ${sku}`);
            }
            const { rows } = await pool.query(
                `
                UPDATE inventory
                SET stock = stock - $1
                WHERE sku = $2
                RETURNING *;
                `,
                [quantity,searchProduct.id]
            );
        }
        await client.query('COMMIT');
        return { message: 'Venta realizada con éxito' };

    
    } catch(err){
        await client.query('ROLLBACK');
        console.log(err)
    } 



}
