const mongoose = require('mongoose');


const TestDateSchema = mongoose.Schema(
    {
        plannedDate: {
            type: Date,
            required: true
        },
        duration: {
            type: Number,
            required: true,
        },
        certif: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Certif"
        },
        subscribedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    }
);

module.exports = mongoose.model('TestDate', TestDateSchema);
