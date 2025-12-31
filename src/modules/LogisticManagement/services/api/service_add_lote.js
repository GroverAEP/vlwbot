export async function ServiceAddLote({pool,data}) {
    let {mfg_date,expiration_date} = data;
    const { rows } = await pool.query(
        `
        INSERT INTO lote (
            id_product,
            mfg_date,
            expiration_date
          )
          VALUES ($1,$2)
          RETURNING *;
        `,
        [mfg_date,expiration_date]
    );

    return rows[0];

}