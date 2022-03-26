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
        testDates: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TestDate"
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
