import pkg from 'pg';
const { Pool } = pkg;

export   class ConexionPostgres {
  static pool = null;

  static getInstance() {
    try{
      if (!ConexionPostgres.pool) {
          ConexionPostgres.pool = new Pool({
            host: 'localhost',
            user: 'postgres',
            password: 'admin',
            database: 'business_v1_db',
            port: 5432,
          });
    
          console.log('🟢 PostgreSQL conectado');
        }
  
        console.log('================================== \n' +
          `### Conexion exitosa con postgress ${this.pool}`
        );
      return ConexionPostgres.pool;
    } catch(err){
      console.log(`Ha ocurrido un error al conectar la bd ${err}`)
    }
  }
}