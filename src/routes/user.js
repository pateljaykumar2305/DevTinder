const express = require('express');
const User = require('../models/userSchema');
const { userAuth } = require('../midleware/auth');
const ConnectionRequest = require('../models/connectionRequest');

const userRouter = express.Router();


userRouter.get('/user/request/received', userAuth, async (req, res) => {
    try{
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
       toUserID: loggedInUser._id,
       status: 'interested'
    }).populate("fromUserID", ["firstName", "lastName", "photoURL", "about", "skills", "age"])

    return res.status(200).json({
        message: 'Connection requests received successfully',
        data: connectionRequests
    })
    }
    catch(error){
        console.error('Error in /user/request:', error.message);
        res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }

})

userRouter.get('/user/connections', userAuth, async (req,res) => {
       try{
              const loggedInUser = req.user;
            
              const allConnections = await ConnectionRequest.find({
                    $or: [
                        { fromUserID: loggedInUser._id, status: 'accepted' },
                        { toUserID: loggedInUser._id, status: 'accepted' }
                    ]
              }).populate([
                    { path: "fromUserID", select: ["firstName", "lastName", "photoURL", "about", "skills", "age"] },
                    { path: "toUserID", select: ["firstName", "lastName", "photoURL", "about", "skills", "age"] }
              ]);

              const data = allConnections.map(connection => {
                        if(connection.fromUserID._id.toString() === loggedInUser._id.toString()){
                        return connection.toUserID;
                    }
                    return connection.fromUserID;
              })
              return res.status(200).json({
                     message: 'Connection requests received successfully',
                     data: data
              })
       }
       catch(error){
           console.error('Error in /user/connections:', error.message);
           res.status(401).json({ message: 'errro inside the userRouter connection' });
       }
})

userRouter.get('/user/feed', userAuth, async (req,res) => {

    try{
        const loggedInUser = req.user;
        const allConnections = await ConnectionRequest.find({
            $or: [
                { fromUserID: loggedInUser._id },
                { toUserID: loggedInUser._id }
            ]
        }).select('fromUserID toUserID')

        const hideUsersfromFeed = new Set();
        allConnections.forEach((req) => {
            hideUsersfromFeed.add(req.fromUserID.toString());
            hideUsersfromFeed.add(req.toUserID.toString());
        })
        console.log('Hide users from feed:', hideUsersfromFeed);

        const allUsers = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersfromFeed) } },
                { _id: { $ne: loggedInUser._id.toString() } }
            ]
        }).select(["firstName", "lastName", "photoURL", "about", "skills", "age"]);
        console.log('All users:', allUsers);

        return res.status(200).json({
            message: 'Feed fetched successfully',
            data: allUsers
        })
    }
    catch(error){
        console.error('Error in /user/feed:', error.message);
        res.status(401).json({ message: 'errro inside the userRouter feed' });
    }
})
module.exports = userRouter;