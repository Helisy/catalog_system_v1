const multer = require('multer');

const storage = multer.diskStorage(
{
    destination: (req, file, cb) => {
        cb(null, 'public/image_storage/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
  
const upload = multer({ storage });

module.exports = upload;