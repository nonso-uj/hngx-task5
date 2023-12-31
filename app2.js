import express from "express"
import http from "http"
import https from "https"
import cors from "cors"
import bodyParser from "body-parser"
import fs from "fs"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))

const server = app.listen(3000, () => {
    console.log("App running on port 3000....")
})


process.on("unhandledRejection", (err)=> {
    console.log("unhandled rejection, Shutting down....");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});





app.get('/create', (req, res) => {
    try{
        const request = http.get('https://hngx-task5.onrender.com/api/ping', (response) => {
            console.log(`Server B responded with status code: ${response.statusCode}`)
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                let data = await JSON.parse(chunk)
                console.log(data)
                res.json(data)
            });
        })


        request.on('error', (e) => {
            console.log('error= ', e.message)
        })
        
        request.end()
        

        
        
        }catch(err){
            res.status(400).json({ error: (err.message ? err.message : err) })
        }

    
})


// app.get('/create', (req, res) => {
//     try{
//         const options = {
//             hostname: '127.0.0.1',
//             port: 4000,
//             path: '/api/create',
//             method: 'POST'
//         }

//         const request = http.request(options, (response) => {
//             console.log(`Server B responded with status code: ${response.statusCode}`)
//             response.setEncoding('utf8');
//             response.on('data', async function (chunk) {
//                 let data = await JSON.parse(chunk)
//                 console.log(data)
//                 res.json(data)
//             });
//         })


//         request.on('error', (e) => {
//             console.log('error= ', e.message)
//         })
        
//         request.end()
        

        
        
//         }catch(err){
//             res.status(400).json({ error: (err.message ? err.message : err) })
//         }

    
// })







app.get('/', (req, res) => {
    try{
        // const file = __dirname + "/send/piece.mp4"
        // const file = __dirname + "/send/tutorial.mp4"
        const file = __dirname + "/send/riddle.mp4"
        if(!fs.existsSync(file)){
            throw "file dosen't exist"
        }

        const readStream = fs.createReadStream(file)

        const options = {
            hostname: 'hngx-task5.onrender.com',
            // hostname: '127.0.0.1',
            // port: 4000,
            // port: 4000,
            path: '/api/save/dc107364-dd33-4bb3-b0fd-e6169933ab37',
            method: 'POST',
            headers: {
                'Content-Type': 'video/mp4',
                'Transfer-Encoding': 'chunked',
            }
        }

        const request = https.request(options, (response) => {
            console.log(`Server B responded with status code: ${response.statusCode}`)
            response.setEncoding('utf8');

            response.on('data', async function (chunk) {
                console.log(chunk)
                let data = await JSON.parse(chunk)
                if(response.statusCode == 400){
                    readStream.destroy()
                }
                res.json(data)
            });
        })



        readStream.on('data', (chunk) => {
            request.write(chunk)
        })

        readStream.on('end', () => {
            request.end()
        })
        
        readStream.on('close', () => {
            request.end()
        })
        
        request.on('error', (e) => {
            readStream.destroy()
            console.log('error= ', e.message)
        })
        
    }catch(err){
        res.status(400).json({ error: (err.message ? err.message : err) })
    }
    
})












export default app;