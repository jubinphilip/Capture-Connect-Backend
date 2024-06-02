const multer = require("multer");
const storages = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, '_' + uniqueSuffix +"_"+file.originalname ) 
    }
  })
  
  const upload = multer({ storage: storages })
  module.exports=upload;