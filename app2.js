import express from "express"
import http from "http"
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
        const options = {
            hostname: '127.0.0.1',
            port: 4000,
            path: '/create',
            method: 'POST'
        }

        const request = http.request(options, (response) => {
            console.log(`Server B responded with status code: ${response.statusCode}`)
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                let data = await JSON.parse(chunk)
                console.log(data)
                res.json({
                    file_id: data.file_id,
                    message: 'File Created again',
                })
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







app.get('/', (req, res) => {
    try{
        const file = __dirname + "/send/piece.mp4"
        if(!fs.existsSync(file)){
            throw "file dosen't exist"
        }

        // const postData = {
        //     file_id: '36f8567f-4c4c-4431-a136-96bbdefe1bf8'
        // }
        const readStream = fs.createReadStream(file)

        const options = {
            hostname: '127.0.0.1',
            port: 4000,
            path: '/2deb2ffc-a9eb-49f9-b975-6dd7b875ed71',
            method: 'POST',
        }

        const request = http.request(options, (response) => {
            console.log(`Server B responded with status code: ${response.statusCode}`)
            response.setEncoding('utf8');

            response.on('data', async function (chunk) {
                let data = await JSON.parse(chunk)
                console.log(data)
                if(data && data.message == 'stop'){
                    readStream.destroy()
                }
            });

            response.on('end', async function (chunk) {
                let data = await JSON.parse(chunk)
                console.log(data)
                res.json({
                    ...data,
                    info: 'File Saved',
                })
            });
        })



        readStream.on('data', (chunk) => {
            // request.write(JSON.stringify({
            //     data: postData
            // }))
            request.write(chunk)
        })

        readStream.on('end', () => {
            request.end()
        })
        
        readStream.on('close', () => {
            request.end()
        })
        
        request.on('error', (e) => {
            console.log('error= ', e.message)
        })
        
    }catch(err){
        res.status(400).json({ error: (err.message ? err.message : err) })
    }
    
    // res.json({message: 'Video sent'})
    
})












export default app;