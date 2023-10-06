
import { Storage } from "@google-cloud/storage";
import ffmpeg = require("fluent-ffmpeg");
import fs = require('fs');


const storage = new Storage();
const rawVideoBucketName = "abra-yt-raw-videos";
const processedVideoBucketName ='abra-yt-processed-videos';

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

export function setupDirectories(){
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);

}

export function convertVideo(rawVideoName: string,processedVideoName: string){
    return new Promise<void>((resolve, reject) =>{

    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
    .outputOptions("-vf","scale=-1:360") // scale to 360p
    .on('end', () =>{
        console.log('Video processed successfully');
        resolve();

    })
    .on('error', (err) =>{
        console.log(`An error occurred:${err.message}`);
        reject(err);
    })
    .save(`${localProcessedVideoPath}/${processedVideoName}`);
})
}


export async function downloadRawVideo(fileName:string){
    await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({destination: `${localRawVideoPath}/${fileName}`});

    console.log(
       `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}` // 
    )

}

export async function uploadProcessedVideo(fileName: string){
    const bucket = storage.bucket(processedVideoBucketName);
    await bucket.upload(`${localProcessedVideoPath}/${fileName}`,{
        destination:fileName
    });
    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs:// 
        ${processedVideoBucketName}/${fileName}.`
    );
    await bucket.file(fileName).makePublic();


}
export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProcessedVideo(fileName:string){
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}


function deleteFile (filePath: string ) : Promise<void> {
    return new Promise((resolve, reject )=> {
        if(fs.existsSync(filePath)){
            // reject(`File ${filePath} does not exist.`);
            fs.unlink(filePath,(err)=> {
                if(err){
                    console.log(`Failed to delete file at ${filePath}`,err);
                    reject(err);
                }else{
                    console.log(`File deleted at ${filePath}`)
                    resolve();
                }
            })
        }else {
            console.log(`File not found at ${filePath}, skipping the delete. `);
            resolve();
        }
    })
}

function ensureDirectoryExistence (dirPath: string){
    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath,{recursive:true});
        console.log(`Directory created at ${dirPath}`);
    }
}