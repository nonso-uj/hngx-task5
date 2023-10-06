# Node.js REST API for Video Streaming and Storage

This Node.js REST API allows you to save streamed videos on disk storage and stream videos back for consumption. Videos are saved as MP4 files on the server and can be accessed using unique UUIDs generated upon creation.

## Usage

1. **Clone the Repository:**
   ```
   git clone https://github.com/yourusername/video-streaming-api.git
   cd video-streaming-api
   ```

2. **Install Dependencies:**
   ```
   npm install
   ```

3. **Run the Server:**
   ```
   npm start
   ```


## Endpoints

### 1. **GET /api/ping**
- **Description:** Check if the server is online and responsive.
- **Example Request:**
  ```
  GET /api/ping
  ```
- **Example Response:**
  ```json
  {
    "success": true,
    "message": "pong"
  }
  ```

### 2. **POST /api/create**
- **Description:** Create an MP4 video file and receive a UUID for future streaming.
- **Example Request:**
  ```
  POST /api/create
  ```
- **Example Response:**
  ```json
  {
    "file_id": "ea37940b-93cf-4062-9632-773e95cb71f7",
    "message": "File created"
  }
  ```

### 3. **POST /api/save/:uuid**
- **Description:** Stream video data to be saved on the server using the provided UUID as a parameter.
- **Example Request:**
  ```
  POST /api/save/3a8d4b26-2d9a-4c48-a687-25e08782c590
  ```
- **Example Response:**
  ```json
  {
    "message": "received",
    "file_id": "60006582-fddd-429e-a6ca-9a67cb87a273"
  }
  ```
  **Edge Case:** In cases where file size exceeds 25mb, the streamed request is stopped, the file is saved and details are returned in response json.
  **Example Response:**
  ```json
  {
    "message": "max file size of 25mb reached",
    "file_id": "ea37940b-93cf-4062-9632-773e95cb71f7",
  }
  ```

### 4. **GET /api/stream/:uuid**
- **Description:** Stream videos saved on the server using the provided UUID as a parameter.
- **Example Request:**
  ```
  GET /api/stream/3a8d4b26-2d9a-4c48-a687-25e08782c590
  ```
- **Example Response:**
  ```
  Video Stream (MP4 Content)
  ```


### 5. **GET /api/transcription/:uuid**
- **Description:** Transcribe a saved video using a UUID.
- **Example Request:**
  ```
  GET /api/transcription/:uuid
  ```
- **Example Response:**
  ```json
  {
       "transcription": {
           "channels": [
               {
                   "alternatives": [
                       {
                           "transcript": "there's no escape where ... conceivable way",
                           "confidence": 0.9291992,
                           "words": [
                               {
                                   "word": "there's",
                                   "start": 0.4389524,
                                   "end": 0.75819045,
                                   "confidence": 0.9975586
                               }, ...
                               ]
                       }
                   ]
               }
           ]
       }
   }
   ```

### 6. **GET /api/all/video**
- **Description:** Get all saved video UUIDs and paths videos saved on the server.
- **Example Request:**
  ```
  GET /api/all/video
  ```
- **Example Response:**
  ```json
  {
       "files": [
           {
               "60006582-fddd-429e-a6ca-9a67cb87a273": "uploads\\1696555244734.mp4"
           }
       ]
   }
  ```

### 7. **GET /api/video-info/:uuid**
- **Description:** Get all file details of a video saved on the server using the provided UUID as a parameter.
- **Example Request:**
  ```
  GET /api/video-info/3a8d4b26-2d9a-4c48-a687-25e08782c590
  ```
- **Example Response:**
  ```json
  {
    "dev": 1053528352,
    "mode": 33206,
    "nlink": 1,
    "uid": 0,
    "gid": 0,
    "rdev": 0,
    "blksize": 4096,
    "ino": 19984723346508770,
    "size": 26214400,
    "blocks": 51200,
    "atimeMs": 1696551241375.8977,
    "mtimeMs": 1696551202189.444,
    "ctimeMs": 1696551202189.444,
    "birthtimeMs": 1696535519803.766,
    "atime": "2023-10-06T00:14:01.376Z",
    "mtime": "2023-10-06T00:13:22.189Z",
    "ctime": "2023-10-06T00:13:22.189Z",
    "birthtime": "2023-10-05T19:51:59.804Z"
  }
  ```
