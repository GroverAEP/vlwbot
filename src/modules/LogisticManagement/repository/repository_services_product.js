import crypto from 'crypto';
import { ServiceSelectFromName } from '../services/api/service_select_from_name.js';
import { ServiceAddOrGet } from '../services/api/service_add_or_get.js';
import { ServiceAddProduct } from '../services/api/service_add_product.js';
import { ServiceGetDefaultId } from '../services/api/service_get_default_id.js';
import { ServiceSearchProduct } from '../services/api/service_search_product.js';
import { ServiceSellProducts } from '../services/api/service_sell_products.js';
import { ServiceSellConfirmed } from '../services/api/service_sell_confirmed.js';
import { ServiceAddLocation } from '../services/api/service_add_location.js';
import { ServiceAddInventory } from '../services/api/service_add_inventary.js';

export class RepositoryServicesProduct {
  constructor({ pool }) {
    console.log(`dentro del constructor de postgressProduct = ${pool}`)
    // if (!pool) throw new Error('Pool requerido');
    this.pool = pool;
    this.allowedTables = ['supplier', 'brand', 'category']
    console.log(this.pool)
    // this.client = client;
  }

  /* =========================
     UTILIDADES
  ========================== */
  
  generateSKU() { 
    return 'PROD-' + crypto.randomUUID().slice(0, 8).toUpperCase();
  }

  validateTable(table) {
    const allowedTables = ['supplier', 'brand', 'category'];
    if (!allowedTables.includes(table)) {
      throw new Error('Tabla no permitida');
    }
  }

  async getDefaultId(table) {
    return await ServiceGetDefaultId({pool:this.pool,table});
  }


  async selectFromName({ table, name }) {
    this.validateTable(table);
    return await ServiceSelectFromName({pool:this.pool,table,name});
  }

  /* =========================
     INSERT GENÉRICO
  ========================== */

  async insertOrGet({ table, name }) {
    try {
      this.validateTable(table);
           // 👉 sin nombre → default
      if (typeof name === 'string' && name.trim() === '' || name === null) {
        return  await this.getDefaultId(table);
      }
  
      return await ServiceAddOrGet({pool:this.pool,table,name});
    
    } catch (error) {
       if (error.code === '23505') {
        return await this.selectFromName({ table, name });
      }
      throw error;
    }
  }

  /* =========================
     PRODUCTO
  ========================== */

  async addProduct({data}) {
        let {
      name_supplier,
      name_brand,
      name_category,
      name,
      description,
      unit_price,
      url
    } = data;
    

    
    if (!name) throw new Error('Nombre de producto requerido');
    if (!unit_price) throw new Error('Precio requerido');

    // relaciones
    const supplier = await this.insertOrGet({
      table: 'supplier',
    name: name_supplier
    });

    const brand = await this.insertOrGet({
      table: 'brand',
      name: name_brand
    });

    const category = await this.insertOrGet({
      table: 'category',
      name: name_category
    });

    const sku = this.generateSKU();
    const location= await this.getDefaultId("location");

    let bd_data = {
      supplier:supplier,
      brand: brand,
      category: category,
      sku:sku,
      name,
      description,
      unit_price,
      url,
    }
    
    const serviceAddProduct =  await ServiceAddProduct({
      pool:this.pool,
      data:bd_data,      
      });
  
    let bd_inven = {
      id_product:serviceAddProduct.product_id,
      id_location: location.id,
      stock: 0
    };

      const serviceAddInventory = await ServiceAddInventory({
        pool:this.pool,
        data:bd_inven,
      })

    // const serviceAddLote = await ServiceAddLote({
    //   pool: this.pool,
    //   id:serviceAddProduct.id,
    //   mfg_date:'', //'2025-01-01',
    //   expiration_date: '' //'2025-12-31'
    // });

    // const serviceAddLocation = await ServiceAddLocation({
    //   pool:this.pool,
    //   data:bd_data,
    // });

    return serviceAddProduct  
  }
  
  async searchProduct({sku}) {
    
    if (!sku) throw new Error('codigo del producto invalido');
    // if (!unit_price) throw new Error('Precio requerido');
    return await ServiceSearchProduct({
      pool: this.pool,
      sku
    })
  }

  async deleteProduct({sku}) {
    if (!sku) throw new Error('Nombre de producto requerido');
    // if (!unit_price) throw new Error('Precio requerido');
    return await ServiceSearchProduct({
      pool: this.pool,
      sku
    })
  }
  
  async sellPreProducts({data}){
    console.log(data);
    let total_amount = 0;
    let new_data= {
      "list_product": [],
      "total_amount":0,
    };




    try {

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No hay información ingresada');
    }
      // if (!data.length > 0 || !Array.isArray(data)) {
      //     throw new Error('No hay información ingresada');
      // }
      


      for(const product of data){
        
        const searchProduct = await this.searchProduct({
              pool:this.pool,
              sku:product.sku
            });
        console.log(searchProduct);
        
        if (!searchProduct) {
            throw new Error(`Producto no encontrado: ${product.sku}`);
        }
  
        const subtotal = product.quantity * searchProduct.unit_price;
        
        new_data.list_product.push({   // 👈 push
            product: searchProduct,
            quantity: product.quantity,
            subtotal
        });
        // let pr = {
        // }
  
        // data_product = pr ;
        // new_data["list_product"].append(data_product)
        total_amount += subtotal;
      }
      new_data.total_amount = total_amount;
  
      return new_data;

    } catch (error) {
      throw error      
    }
  }
    




  async sellConfirmedProducts({data}) {
    // A_A
    // if (!skus) throw new Error('coloca un sku para vender');    
    if (!data) throw new Error('No hay informacion ingresada');
    
    //Primera parte: Vender el producto : Solo ingresa el comando 
    //!Sell 
    //Para activarlo

    //Segunda parte: Ingresar informacion de los producots : 
    // codigo: PROD-AD12BD2JE2, cantidad: 2 | codigo: PROD-CD12AS12D2, cantidad: 2
    //Ingresa los valores a vender

    return await ServiceSellConfirmed({
      pool:this.pool,
      data
    })


    //return
    
    // return await ServiceSellProducts({
    //   data
    // })

  }

}
