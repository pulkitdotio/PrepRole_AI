const multer = require('multer');
const L = require('../config/contentLimits');
const { ContentError } = require('../utils/content');

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        // Busboy signals partsLimit upon reaching it; allow the three expected parts.
        fileSize: L.pdfBytes, files: 1, fields: 2, parts: 4,
        fieldSize: L.fieldBytes, fieldNameSize: 64, headerPairs: 100
    },

    fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
            return callback(
                new ContentError(400, 'Only PDF resume files are allowed')
            );
        }

        callback(null, true);
    }
});

module.exports = upload;
