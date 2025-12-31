export async function ServiceSearchProduct({pool,sku}) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM product
        WHERE sku = $1;
        `,
        [sku]
    );

    return rows[0];

}