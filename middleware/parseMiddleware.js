const IMAGE_UPLOAD_DIR = "./images";
const multiparty = require('multiparty');

const formParser = (req, res, next) => {
    var form = new multiparty.Form({uploadDir: IMAGE_UPLOAD_DIR});
    form.parse(req, function(err, fieldsObject, filesObject, fieldsList, filesList) {
    req.fields = fieldsObject;
    console.log(fieldsObject);
    req.filex = filesObject; 
    console.log(filesObject);
    next();
    });

}

module.exports = { formParser };