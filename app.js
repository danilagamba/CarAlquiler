// Backend: app.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'CarRental'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});

// Endpoint 1.4: Consulta detallada
app.get('/api/alquileres', (req, res) => {
  const sql = `SELECT 
                CLIENTE.CEDULA, 
                CLIENTE.NOMBRE, 
                ALQUILER.FECHA AS FECHA_ALQUILER, 
                ALQUILER.TIEMPO AS TIEMPO_ALQUILADO, 
                ALQUILER.SALDO, 
                CARRO.PLACA, 
                CARRO.MARCA
              FROM ALQUILER
              INNER JOIN CLIENTE ON ALQUILER.CEDULA = CLIENTE.CEDULA
              INNER JOIN CARRO ON ALQUILER.PLACA = CARRO.PLACA`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      res.json(results);
    }
  });
});

// Endpoint 2.2: Filtro por fechas
app.get('/api/alquileres/filtrar', (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  const sql = `SELECT 
                CLIENTE.CEDULA, 
                CLIENTE.NOMBRE, 
                ALQUILER.FECHA AS FECHA_ALQUILER, 
                ALQUILER.TIEMPO AS TIEMPO_ALQUILADO, 
                ALQUILER.SALDO, 
                CARRO.PLACA, 
                CARRO.MARCA
              FROM ALQUILER
              INNER JOIN CLIENTE ON ALQUILER.CEDULA = CLIENTE.CEDULA
              INNER JOIN CARRO ON ALQUILER.PLACA = CARRO.PLACA
              WHERE ALQUILER.FECHA BETWEEN ? AND ?`;

  db.query(sql, [fechaInicio, fechaFin], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      res.status(500).json({ error: 'Error al filtrar los datos' });
    } else {
      res.json(results);
    }
  });
});

// Endpoint 2.3: Alquileres diarios y mensuales
app.get('/api/alquileres/resumen', (req, res) => {
  const sqlDiario = `SELECT DATE(FECHA) AS FECHA, COUNT(*) AS ALQUILERES_DIA FROM ALQUILER GROUP BY DATE(FECHA)`;
  const sqlMensual = `SELECT DATE_FORMAT(FECHA, '%Y-%m') AS MES, COUNT(*) AS ALQUILERES_MES FROM ALQUILER GROUP BY DATE_FORMAT(FECHA, '%Y-%m')`;

  db.query(sqlDiario, (errDiario, resultadosDiarios) => {
    if (errDiario) {
      console.error('Error al obtener alquileres diarios:', errDiario);
      res.status(500).json({ error: 'Error al obtener alquileres diarios' });
    } else {
      db.query(sqlMensual, (errMensual, resultadosMensuales) => {
        if (errMensual) {
          console.error('Error al obtener alquileres mensuales:', errMensual);
          res.status(500).json({ error: 'Error al obtener alquileres mensuales' });
        } else {
          res.json({ diarios: resultadosDiarios, mensuales: resultadosMensuales });
        }
      });
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
