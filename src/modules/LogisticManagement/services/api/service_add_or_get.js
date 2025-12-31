export async function ServiceAddOrGet({pool,table,name}) {
    
    const { rows } = await pool.query(
    `
    INSERT INTO ${table} (name)
    VALUES ($1)
    RETURNING id,name;
    `,
    [name]
    );

    return rows[0];

}