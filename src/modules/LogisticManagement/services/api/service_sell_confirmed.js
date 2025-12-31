export async function ServiceSellConfirmed({pool,data}) {
    let {sku}= data;
    
    const { rows } = await pool.query(
        `
        SELECT * FROM inventory
        WHERE sku = $1
        `,
        [sku]
   );
        
}