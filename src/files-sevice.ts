import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs/promises";
import path from "path";
import crypto from 'crypto'
import {exec} from "child_process";


export async function ahmedMohsenHandler(files: Express.Multer.File[]) {
    const filePaths = files.map(x => path.resolve(x.path));
    return concatenateAudioFiles(filePaths);
}


const concatenateAudioFiles = async (userFiles: string[]) => {
    const outputFilePath = path.resolve(path.join('./assets/concatenated', `${crypto.randomUUID()}-${new Date().toISOString()}.mp3`));

    let ahmedMohsenFiles = await fs.readdir(path.resolve('./assets/original-ahmed-mohsen'))
    ahmedMohsenFiles = ahmedMohsenFiles.map((n) => path.resolve(path.join('./assets/original-ahmed-mohsen', n)))

    console.log(ahmedMohsenFiles)

    let audioFiles: string[];
    if (userFiles.length === 3) {
        audioFiles = [
            userFiles[0],
            ahmedMohsenFiles[0],
            userFiles[1],
            ahmedMohsenFiles[1],
            userFiles[2],
            ahmedMohsenFiles[2]
        ]
    } else {
        audioFiles = [
            ahmedMohsenFiles[0],
            userFiles[1],
            ahmedMohsenFiles[1],
            userFiles[2],
            ahmedMohsenFiles[2]
        ]
    }

    return  new Promise<string>(async (resolve, reject) => {
        const command = ffmpeg();

        try {
            for (let index = 0; index < audioFiles.length; index++) {
                const streamTypes = await getStreamTypes(audioFiles[index]);
                const inputIndex = streamTypes.indexOf('audio');
                if (inputIndex >= 0) {
                    command.input(audioFiles[index]);
                } else {
                    console.error(`No audio stream found in file: ${audioFiles[index]}`);
                }
            }


            let filterComplex = audioFiles.map((input, index) => `[${index}:a]`).join('');
            filterComplex += `concat=n=${audioFiles.length}:v=0:a=1[outa]`;

            command.complexFilter(filterComplex, 'outa');
            command.output(outputFilePath);

            command.on('end', () => {
                console.log('Audio files concatenated successfully');
                deleteFiles(userFiles)
                resolve(outputFilePath);
            }).on('error', (err) => {
                console.error('Error concatenating audio files:', err);
                reject(err);
            }).run();

        } catch (error) {
            console.error('Error retrieving stream information:', error);
            throw error
        }
    });
};

function deleteFiles(files: string[]) {
    for (let file of files) {
        fs.unlink(file)
    }
}

function getStreamTypes(file: string) {
    return new Promise<string[]>((resolve, reject) => {
        exec(`ffprobe -v error -show_entries stream=codec_type -of csv=p=0 ${file}`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            const streamTypes = stdout.trim().split('\n');
            resolve(streamTypes);
        });
    });
}