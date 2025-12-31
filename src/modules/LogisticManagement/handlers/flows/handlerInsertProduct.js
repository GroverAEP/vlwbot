import pkg from 'pg';
import { pg_insert_product } from '../../services/a.js';
import { RepositoryServicesProduct } from '../../repository/repository_services_product.js';

const { Pool } = pkg;


export const handlerInsertProduct= {
    name: "pokemonApi",
    role: "all",
    run: insertProduct,
};

async function insertProduct({msg,client,cmd}) {
    
}
