import multer from 'multer';
import  fs  from 'fs';

//images to be stored in uploads



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = 'uploads/' + req.userId
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            cb(null, dir)
        }else{
            cb(null,dir)
        }
    

    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}
const upload = multer({
    storage: storage,fileFilter:fileFilter
  });
  
export default upload;
