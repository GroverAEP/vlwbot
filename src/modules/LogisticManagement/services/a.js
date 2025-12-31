import crypto from 'crypto';


//Documentacion:  postgres_create_product
// Input : !create product_A [marca proveedor categoria] description 

// data :{
//   sku
//   name_supplier,
//   name_brand,
//   name_category,
//   name,
//   description,
//   unit_price,
//   url
// }

async function pg_get_default_id(table) {
  const { rows } = await pool.query(
    `
    SELECT id
    FROM ${table}
    WHERE is_default = true
    LIMIT 1;
    `
  );

  if (!rows[0]) {
    throw new Error(`No existe registro default en ${table}`);
  }

  return rows[0].id;
}






async function pg_select_from_name({ table, name }) {
  const allowedTables = ['supplier', 'brand', 'category'];

  if (!allowedTables.includes(table)) {
    throw new Error('Tabla no permitida');
  }

  const query = `
    SELECT id
    FROM ${table}
    WHERE LOWER(name) = LOWER($1)
    LIMIT 1;
  `;

  const { rows } = await pool.query(query, [name]);

  return rows[0];
}


async function pg_insert({table, name}) {
      const allowedTables = ['supplier', 'brand', 'category'];

  if (!allowedTables.includes(table)) {
    throw new Error('Tabla no permitida');
  }
  
  // 👉 si no hay nombre → default
  if (!name || !name.trim()) {
    return { id: await pg_get_default_id(table) };
  }

  
  try{
    const query = `
    INSERT INTO ${table} (name)
    VALUES ($1)
    RETURNING id;
    `;

    const {rows} = await pool.query(query,[name])
    
    // return rows[0];
    return { success: true, 
      id: rows[0].id 
    };
    
  } catch (error){
      if (error.code === '23505') {
      // duplicado → lo buscamos
      return await pg_select_from_name({ table, name });
    }
    // throw error;
    console.log(error.message);
    
    return {
      success: false,
      message: error.message
    };
  }
}

function generateSKU() {
  return 'PROD-' + crypto.randomUUID().slice(0, 8).toUpperCase();
}



export async function pg_insert_product({client, data}) {
    
  const Conexion = client.db.postgres;
  Conexion.getInstance();
  const pool = Conexion.pool;

  let {
      name_supplier,
      name_brand,
      name_category,
      name,
      description = '',
      unit_price,
      url
    } = data;
    

    //crea el supplier y si existe entonces obtiene la id
    const supplier = await pg_insert({
       table: 'supplier',
      name: name_supplier
    });

    const brand = await pg_insert({
      table: 'brand',
      name: name_brand
    });

    const category = await pg_insert({
      table: 'category',
      name: name_category
    });

    
    //buscando si el id supplier brand o id category existen
    // Obteniendo por defecto la id de (supplier - brand - category)
   // SUPPLIER

    
    // IDs finales
    const id_supplier = supplier.id;
    const id_brand = brand.id;
    const id_category = category.id;
    
    
    if (!description){
      description = ""
    }
    

    const sku = generateSKU();
      
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
        [sku, id_supplier, id_brand, id_category, name, description, unit_price, url]
      );
  
  
      return {
        success: true,
        message: `Producto creado correctamente: \n
                  |sku: ${sku} \n
                  |name: ${name} \n
                  |proveedor: ${supplier} \n 
                  |marca: ${brand} \n
                  |categoria:${category} \n
                  |precio: ${unit_price} \n
  
  
                  `,
        product_id: rows[0].id
      };
    } catch (error) {
       if (error.code === '23505') {
      //   // duplicado → lo buscamos
      //   return await pg_select_from_name({ table, name });
      if (error.code !== '23505') throw error;
      attempts++;
      }
      throw error;
    }

}

  throw new Error('No se pudo generar un SKU único');
}