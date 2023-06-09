import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs/promises";
import path from "path";


export async function ahmedMohsenHandler(files: Express.Multer.File[]) {
    const filePaths = files.map(x => x.path);
    try {
        return await concatenateAudioFiles(filePaths);
    } catch (e) {
        throw (e);
    } finally {
        deleteFiles(filePaths);
    }
}


const concatenateAudioFiles = (files: string[]) => {
    let outputFilePath = path.join('./assets/concatenated', `${new Date()}.mp3`);
    const promise: Promise<string> = new Promise((resolve, reject) => {
        // let command = ffmpeg();

        ffmpeg()
            .input(files[0])
            .input(files[1])
            .input(files[2])
            .on("error", (err) => {
                console.error("An error occurred: " + err.message);
                reject(err)
            })
            .on("end", (output: string) => {
                console.log("Audio files concatenated successfully!");
                resolve(path.resolve(output))
            })
            .concat(outputFilePath)
            .run();
    });
    return promise;
};

function deleteFiles(files: string[]) {
    for (let file of files) {
        fs.unlink(path.absolute())
    }
}