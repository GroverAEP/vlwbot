import pkg from 'pg';
import { pg_insert_product } from '../../services/a.js';
import { RepositoryServicesProduct } from '../../repository/repository_services_product.js';

const { Pool } = pkg;


export const handlerSearchProduct= {
    name: "pokemonApi",
    role: "all",
    run: searchProduct,
};

async function searchProduct({msg,client,cmd}) {
    // INPUT
    //bp {SKU}
    // OUTPUT
    // products

    const Conexion = client.db.postgres;    
    const pool = Conexion.getInstance();

    const ProductService = RepositoryServicesProduct({pool});

    const json_search_product  = await ProductService.searchProduct({sku})

    await client.send.reply(msg,"Producto Generado")
    

}   
