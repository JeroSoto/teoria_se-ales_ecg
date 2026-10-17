const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/config', (req, res) => {
    res.json({
        nombreProyecto: "Simulador ECG & Teoría de Señales",
        frecuenciaMuestreoHz: 250,
        bpmPorDefecto: 75,
        amplitudPorDefecto: 1.0,
        nivelRuidoPorDefecto: 15
    });
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Servidor ECG iniciado correctamente.`);
    console.log(`Accede en tu navegador a: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
