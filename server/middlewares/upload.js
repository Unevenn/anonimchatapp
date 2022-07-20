import multer from 'multer';
import {GridFsStorage} from 'multer-gridfs-storage'

const CONNECTION_URL = `mongodb+srv://mustafa:1234@cluster0.mimzkbd.mongodb.net/?retryWrites=true&w=majority`

const upload = new GridFsStorage({
    url: CONNECTION_URL,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                req.filename = filename;
                const fileInfo = {
                    filename: filename,
                    bucketName: 'photos'
                };
                resolve(fileInfo);
            });
        });
    }
});

export default multer({ upload });
