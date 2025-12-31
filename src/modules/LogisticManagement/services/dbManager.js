export const DatabaseConnectionManager = {
  getConnection(client) {
    const Conexion = client.db.postgres;
    return Conexion.getInstance();
  },

  closeConnection(pool) {
    if (pool) pool.end();
  }
};
