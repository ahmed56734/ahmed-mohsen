import createApplication, {Request, Response} from 'express'
import multer from "multer";
import {ahmedMohsenHandler} from "./files-sevice";

const uploads = multer({dest: `./assets/temp`})
const app = createApplication();


app.post("/ahmedmohsen", uploads.array('audio', 3),async (req: Request, res: Response) => {
    try{
        const file = await ahmedMohsenHandler(req.files as  Express.Multer.File[]);
        res.send('done')
    }catch (e){
        console.error(e)
        res.status(500)
        res.send("something wrong")
    }

})

app.listen(3000, () => {
    console.log(`app started on http://localhost:3000`)
});