import express = require("express");
import ffmpeg = require("fluent-ffmpeg");

const app = express();
app.use(express.json());


app.post('/process-video', (req, res) => {
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if(!inputFilePath || !outputFilePath){
        res.status(400).send("Bad Request : Missing file path");
    }
    ffmpeg(inputFilePath)
    .outputOptions("-vf","scale=-1:360") // scale to 360p
    .on('end', () =>{
        return res.status(200).send('Video processed successfully');

    })
    .on('error', (err) =>{
        console.log(`An error occurred:${err.message}`);
        res.status(500).send(`Internal Server Error: ${err.message}`);
    })
    .save(outputFilePath);

});


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("listening on port " + port);
});