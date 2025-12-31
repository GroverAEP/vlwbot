export async function ServiceAddLocation({pool,data}) {
    let {name,direction} = data;
    
    const { rows } = await pool.query(
        `
          INSERT INTO location (
            name,direction
          )
          VALUES ($1,$2)
          RETURNING *;
          `,
        [name,direction]
    );

    return rows[0];

}