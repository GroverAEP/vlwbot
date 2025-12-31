import pkg from 'pg';
import { pg_insert_product } from '../../services/a.js';
import { RepositoryServicesProduct } from '../../repository/repository_services_product.js';

const { Pool } = pkg;


export const handlerCreateProduct= {
    name: "pokemonApi",
    role: "all",
    run: CreateProduct,
};

async function CreateProduct({msg,client,cmd}) {
    //!add {nombre: ,}
    "{nombre:  description:  marca: proveedor: categoria: unit_price: }"



    const json_to_object  =  stringToObject(cmd);
    // console.log(client)
    // console.log(json_to_object)
    
    console.log(json_to_object)
    const Conexion = client.db.postgres;    
    // console.log(Conexion);
    // console.log(Conexion.pool);
    // const pool =Conexion.getInstance();
      const pool = null;
    // console.log(pojsool);
    const ProductService = await new RepositoryServicesProduct({pool});
    
    const json_add_product  =await ProductService.addProduct({data:json_to_object})
    
    
    const message = `Producto creado correctamente: 
                  |sku: ${json_add_product.sku} \n
                  |name: ${json_add_product.name} \n
                  |proveedor: ${json_add_product.supplier} \n 
                  |marca: ${json_add_product.brand} \n
                  |categoria:${json_add_product.category} \n
                  |precio: ${json_add_product.unit_price} \n
                  |fecha: ${json_add_product.created_at}
                  `

    const message_success =`✅ *Producto creado correctamente*\n Generando el SKU`;
    const message_sku = json_add_product.sku;

    client.send.reply(msg, message_success)
    .then(() => {
      return client.send.text(msg, message_sku);
    })
    .catch(err => console.error(err));
}



function stringToObject(str) {
 // 1️⃣ quitar llaves externas y comillas
  str = str.trim().replace(/^["'{]+|["'}]+$/g, '');

  // 2️⃣ separar por comas entre campos
  const fields = str.split(/\s*,\s*/);

  const obj = {};

  for (const field of fields) {
    const idx = field.indexOf(':');
    if (idx === -1) continue;

    const key = field.slice(0, idx).trim().toLowerCase();
    let value = field.slice(idx + 1).trim();

    // vacíos → ''
    if (!value) value = '';

    obj[key] = value;
  }

  return {
    name: obj.nombre || obj.name || undefined,
    description: obj.descripcion || '',
    name_brand: obj.marca || null,
    name_supplier: obj.proveedor || null,
    name_category: obj.categoria || null,
    unit_price: obj.precio ? Number(obj.precio) : NaN,
    url: obj.url || null
  };
}
// const product = stringToObject(text);

// console.log(product);
