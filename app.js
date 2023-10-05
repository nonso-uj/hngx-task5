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


app.get('/video/:uuid', (req, res) => {
    const uuid = req.params.uuid.toString()
    filePath = getVideoPath(uuid)
    

    try{
        const file = path.join(__dirname, filePath)
        if(!fs.existsSync(file)){
            throw "file dosen't exist"
        }
        console.log(file)
        res.sendFile(file)
    }catch(err){
        res.status(400).json({ error: (err.message ? err.message : err) })
    }
})


app.get('/:uuid', (req, res) => {
    const range = req.headers.range
    const uuid = req.params.uuid.toString()

    if(!range){
        res.status(400).json({error: "Requires Range header"})
    }
    if(!uuid){
        res.status(400).json({error: "Requires uuid param"})
    }

    try{
        const filePath = getVideoPath(uuid)
        const file = path.join(__dirname, filePath)
        // console.log(file)
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
        console.log(err)
        res.status(400).json({error: (err.message ? err.message : err)})
    }
})




app.post('/create', (req, res) => {
    try{
        const uuid = uuid4()
        const fileName = Date.now().toString() + '.mp4'
        const filePath = path.join(uploadsDir, fileName)
        fs.openSync(filePath, 'w')

        console.log('creating')
        
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
        console.log(err)
        res.status(400).json({error: (err.message ? err.message : err)})
    }
})



app.post("/:uuid", (req, res) => {
    console.log("********START INCOMING DATA************")
    const uuid = req.params.uuid.toString()

    const filePath = getVideoPath(uuid)

    console.log('path= ', uuid, filePath)

    const newFileStream = fs.createWriteStream(filePath)
    let size = 0
    
    req.on('data', (chunk) => {
        console.log('********NEW CHUNK************')
        console.log(chunk)
        size += chunk.length

        if(size > 10485760){
            newFileStream.end()
            // req.destroy()
            // res.json({
            //     message: "file limit exceded",
            //     file_id: uuid
            // })
            // return res.end()
            return
        }else{
            newFileStream.write(chunk)
        }

        newFileStream.on('end', () => {
            res.status(200).json({
                message: "received",
                file_id: uuid
            })
        })
    })

    
    req.on('end', () => {
        newFileStream.end()
        console.log('Video received and saved')
        // res.status(200).json({
        //     message: "received",
        //     file_id: uuid
        // })
    })
    
    

    console.log("********END INCOMING DATA************")

    }
)



app.all("*", (req, res) => {
    res.status(400).json({error: `Can't find ${req.originalUrl} on this server`});
})

export default app;