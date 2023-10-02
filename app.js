import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import multer from "multer"
import fs from "fs"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = './uploads'

const app = express()

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))


let files = fs.readdirSync(uploadsDir)

let latestPath = `${uploadsDir}/${files[0]}`
let latestTimeStamp = fs.statSync(latestPath).mtime.getTime()

files.forEach(file => {

  let path = `${uploadsDir}/${file}`

  let timeStamp = fs.statSync(path).mtime.getTime()

  if (timeStamp > latestTimeStamp) {
    latestTimeStamp = timeStamp
    latestPath = path
  }
});




const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
        let fileName = file.originalname.trim().replace(/\s/g, '-').replace(".mp4", '')
        // console.log(`'${file.originalname.trim().replace(/\s/g, '-')}'`)
        cb(null, file.fieldname + '-' + fileName + '-' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100000000 // 10000000 Bytes = 10 MB
        },
    fileFilter(req, file, cb) {
        // upload only mp4 and mkv format
        if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) { 
            return cb(new Error('Please upload a video'))
        }
        cb(undefined, true)
    }
})

app.get("/ping", (req, res) => {
    res.status(200).json({
        success: true,
        message: "pong",
    });
});


app.get('/video', (req, res) => {
    try{
        const file = __dirname + latestPath.replace(/[.]/, '')
        if(!fs.existsSync(file)){
            throw "file dosen't exist"
        }
        console.log(file)
        res.sendFile(file)
    }catch(err){
        res.status(400).json({ error: err })
    }
})


app.get('/', (req, res) => {
    const range = req.headers.range

    if(!range){
        res.status(400).json({error: "Requires Range header"})
    }
    try{
        // const videoPath = latestPath
        const file = __dirname + latestPath.replace(/[.]/, '')
        if(!fs.existsSync(file)){
            throw "file dosen't exist"
        }
        const videoSize = fs.statSync(latestPath).size
        // console.log(videoSize)
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
        const videoStream = fs.createReadStream(latestPath, {start, end})
        videoStream.pipe(res)
    }catch(err){
        console.log(err)
        res.status(400).json({error: (err.message ? err.message : err)})
    }
})


app.post("/", upload.single('video'), (req, res) => {
    res.status(200).json({
        message: "received",
        filename: req.file.filename
    })}, (error, req, res, next) => {
        res.status(400).send({ error: error.message })
    }
)


app.all("*", (req, res) => {
    res.status(400).json({error: `Can't find ${req.originalUrl} on this server`});
})

export default app;