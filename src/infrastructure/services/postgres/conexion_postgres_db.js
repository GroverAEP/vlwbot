import pkg from 'pg';
export async function conexion_postgres(params) {
    const { Pool } = pkg;

    const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'admin',
    database: 'business_v1_db',
    port: 5432,
    });

    return pool;
}