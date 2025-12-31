export async function ServiceSelectFromName({pool,table,name}) {

    const { rows } = await pool.query(
      `
      SELECT id,name
      FROM ${table}
      WHERE LOWER(name) = LOWER($1)
      LIMIT 1;
      `,
      [name]
    );

    return rows[0];
}