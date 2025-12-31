export async function ServiceUpdateProduct({data}) { 
    let { sku, unit_price } =data

    const { rows } = await pool.query(
        `
        UPDATE product
        SET unit_price = $1
        WHERE sku = $2
        RETURNING *;
        `,
        [unit_price,sku]
    );
    
    console.log('Producto actualizado:', rows[0]);
    return rows[0]


}