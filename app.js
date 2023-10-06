import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import multer from "multer"
import fs from "fs"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import {v4 as uuid4} from "uuid"

// GET LATEST VIDEO FILE 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = './uploads'

// START EXPRESS APP
const app = express()

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))



const getVideoPath = (uuid) => {
    const jsonFile = fs.readFileSync('fileNames.json')
    const jsonData = JSON.parse(jsonFile)
    const filePath = jsonData.files.find((file) => file[uuid])
    return filePath[uuid]
}



app.get("/ping", (req, res) => {
    res.status(200).json({
        success: true,
        message: "pong",
    });
});


app.get('/video-info/:uuid', (req, res) => {
    const uuid = req.params.uuid.toString()
    const filePath = getVideoPath(uuid)
    

    try{
        const file = path.join(__dirname, filePath)
        if(!fs.existsSync(file)){
            throw "file dosen't exist"
        }
        res.status(200).json(fs.statSync(file))
    }catch(err){
        res.status(400).json({ error: (err.message ? err.message : err) })
    }
})


app.get('/:uuid', (req, res) => {
    const range = req.headers.range
    const uuid = req.params.uuid.toString()

    if(!range){
       return res.status(400).json({error: "Requires Range header"})
    }
    if(!uuid){
        return res.status(400).json({error: "Requires uuid param"})
    }

    try{
        const filePath = getVideoPath(uuid)
        const file = path.join(__dirname, filePath)
        if(!fs.existsSync(file)){
            throw "file dosen't exist"
        }

        const videoSize = fs.statSync(file).size
        const CHUNK_SIZE = 10 ** 6
        const start = Number(range.replace(/\D/g, ""))
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        }
    
        res.writeHead(206, headers)
        const videoStream = fs.createReadStream(file, {start, end})
        videoStream.pipe(res)
    }catch(err){
        // console.log(err)
        res.status(400).json({error: (err.message ? err.message : err)})
    }
})




app.post('/create', (req, res) => {
    try{
        const uuid = uuid4()
        const fileName = Date.now().toString() + '.mp4'
        const filePath = path.join(uploadsDir, fileName)
        fs.openSync(filePath, 'w')

        // console.log('creating')
        
        if(!fs.existsSync(filePath)){
            throw "file not created"
        }

        const jsonFile = fs.readFileSync('fileNames.json')
        const jsonData = JSON.parse(jsonFile)
        jsonData.files.push({
            [uuid]: filePath
        })
        fs.writeFileSync('fileNames.json', JSON.stringify(jsonData, null, "\t"))

        res.status(200).json({
            message: "File created",
            file_id: uuid
        })
    }catch(err){
        // console.log(err)
        res.status(400).json({error: (err.message ? err.message : err)})
    }
})



app.post("/:uuid", (req, res) => {
    // console.log("********START INCOMING DATA************")
    const uuid = req.params.uuid.toString()
    const filePath = getVideoPath(uuid)
    const newFileStream = fs.createWriteStream(filePath)
    let size = 0

    
    req.on('data', (chunk) => {
        console.log('********NEW CHUNK************')
        size += chunk.length
        if(size > 26214400){
            newFileStream.end()
            if(!res.headersSent){
                res.status(400).json({
                    message: "max file size of 25mb reached",
                    file_id: uuid
                })
            }
        }else{
            newFileStream.write(chunk)
        }

    })

    
    req.on('end', () => {
        newFileStream.end()
        if(!res.headersSent){
            res.status(200).json({
                message: "received",
                file_id: uuid
            })
        }
    })

    // newFileStream.on('end', () => {
    //     console.log('Video received and saved')
    // })
    
    // newFileStream.on('close', () => {
    //     console.log('Video max size reached and saved')
    // })
    console.log("********END INCOMING DATA************")

    }
)



app.all("*", (req, res) => {
    res.status(400).json({error: `Can't find ${req.originalUrl} on this server`});
})

export default app;