
const result = await pool.query('SELECT * FROM supplier');
console.log(result.rows);