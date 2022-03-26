const mongoose = require('mongoose');


const CertifSchema = mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
            unique: true
        },

        description: {
            type: String,
            required: true,
        },
        tests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Test"
            }
        ],
        selectedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    }
)

module.exports = mongoose.model('Certif', CertifSchema);
