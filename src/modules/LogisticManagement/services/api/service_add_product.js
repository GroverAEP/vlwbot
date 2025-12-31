export async function ServiceAddProduct({pool,data}) {
    let {
      supplier,
      brand,
      category,
      sku,
      name,
      description,
      unit_price,
      url
    } = data;


    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    while (attempts < MAX_ATTEMPTS) {
      try {
        const { rows } = await pool.query(
          `
          INSERT INTO product (
            sku, id_supplier, id_brand, id_category,
            name, description, unit_price, url
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          RETURNING *;
          `,
          [
            sku,
            supplier.id,
            brand.id,
            category.id,
            name,
            description,
            unit_price,
            url
          ]
        );

        return {
          success: true,
          product_id: rows[0].id,
          name: rows[0].name,
          sku: rows[0].sku,
          supplier: supplier.name,
          brand: brand.name,
          category: category.name,
          unit_price: rows[0].unit_price,
          created_at: rows[0].created_at
        };
      } catch (error) {
        if (error.code === '23505') {
          attempts++;
          continue;
        }
        throw error;
      }
    }

    throw new Error('No se pudo generar un SKU único');
}
