import multer from 'multer';

const storage = multer.diskStorage({
  destination : function (req,res,cb){
    cb(null,"uploads/");
  },
  filename : function (req,res,cb){
    cb(null,Date.now() + "-" + req.file.originalname);
  }
});

const upload = multer({storage});
export default upload;