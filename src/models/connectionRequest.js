const mongoose = require('mongoose');   

const conectionRequestSchema = new mongoose.Schema({
    fromUserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: {

            values : ['ignore' , 'interested', 'accepted', 'rejected','blocked'],
            message: '{VALUE} is incorrect status type'
        }
    }
}, { timestamps: true });

conectionRequestSchema.index({ fromUserID: 1, toUserID: 1 }, { unique: true });

const ConnectionRequestModel = mongoose.model('ConnectionRequest', conectionRequestSchema);

module.exports = ConnectionRequestModel;