import express from 'express';
import fs from 'fs';
import path from 'path';

const { promises: fsPromises } = fs;
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.urlencoded({ extended: true }));//middleware q analiza datos del form
app.use(express.static('public'));//middleware sirve archivos estáticos

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

//ruta para agregar deporte
app.post('/editar', async (req, res) => {
    const { nombre, precio } = req.body;

    try {
        let deportesData;
        try {
            deportesData = JSON.parse(await fsPromises.readFile('deportes.json', 'utf8'));
        } catch (err) {
            deportesData = { deportes: [] };
        }
        let deportes = deportesData.deportes;

        const index = deportes.findIndex(d => d.nombre === nombre);
        if (index !== -1) {
            deportes[index].precio = precio;
        } else {
            deportes.push({ nombre, precio });
        }
        //array actualizado en deportes.json
        await fsPromises.writeFile('deportes.json', JSON.stringify(deportesData, null, 2));

        //actualizar deportes_consulta.json
        let deportesConsultaData;
        try {
            deportesConsultaData = JSON.parse(await fsPromises.readFile('deportes_consulta.json', 'utf8'));
        } catch (err) {
            deportesConsultaData = { deportes: [] };
        }
        let deportesConsulta = deportesConsultaData.deportes;

        //sintaxis === -1 busca confirmar que el deporte no exista para subirlo
        if (index === -1) {
            deportesConsulta.push({ nombre });
            await fsPromises.writeFile('deportes_consulta.json', JSON.stringify(deportesConsultaData, null, 2));
        }

        res.send('Deporte actualizado correctamente');
    } catch (error) {
        res.send('Error al actualizar el deporte');
    }
});

app.post('/eliminar', async (req, res) => {
    const { nombre } = req.body;

    try {
        const deportesData = JSON.parse(await fsPromises.readFile('deportes.json', 'utf8'));
        let deportes = deportesData.deportes;

        //filter filtra el nombre ingresado y no lo muestra
        deportes = deportes.filter(d => d.nombre !== nombre);
        deportesData.deportes = deportes;

        await fsPromises.writeFile('deportes.json', JSON.stringify(deportesData, null, 2), 'utf8');

        const deportesConsultaData = JSON.parse(await fsPromises.readFile('deportes_consulta.json', 'utf8'));
        let deportesConsulta = deportesConsultaData.deportes;

        deportesConsulta = deportesConsulta.filter(d => d.nombre !== nombre);
        deportesConsultaData.deportes = deportesConsulta;

        await fsPromises.writeFile('deportes_consulta.json', JSON.stringify(deportesConsultaData, null, 2), 'utf8');

        res.send('Deporte eliminado correctamente');

    } catch (error) {
        res.send('Error al eliminar el deporte');
    }
});

//maravillosa forma de leer el archio json
app.get('/deportes_consulta.json', (req, res) => {
    fs.readFile('./deportes_consulta.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo JSON:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        //setHeader devuelve el contenido del archivo JSON como respuesta
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});


app.listen(PORT, console.log(`🔥Server on 🔥 http://localhost:${PORT}`));