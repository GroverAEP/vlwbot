export async function ServiceGetDefaultId({pool,table}) {
     const { rows } = await pool.query(
      `
      SELECT id,name
      FROM ${table}
      WHERE is_default = true
      LIMIT 1;
      `
    );

    if (!rows[0]) {
      throw new Error(`No existe registro default en ${table}`);
    }

    return rows[0];
}