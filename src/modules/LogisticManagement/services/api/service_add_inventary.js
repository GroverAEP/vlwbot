export async function ServiceAddInventory({pool,data}) {
    let {
        id_location,
        id_product,
        stock
        ,} = data;
    
     const { rows } = await pool.query(
        `
        INSERT INTO inventory (id_location, id_product)
        VALUES ($1, $2)
        RETURNING *;
        `,
        [id_location, id_product]
    );

    return rows[0];

}