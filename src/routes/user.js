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
                console.log('All connections:', allConnections);
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

userRouter.get('/user/suggestions', userAuth, async (req,res) => {
    try {
        const loggedInUser = req.user;
        const allConnections = await ConnectionRequest.find({
            $or: [
                { fromUserID: loggedInUser._id },
                { toUserID: loggedInUser._id }
            ]
        }).select('fromUserID toUserID status');

        const hideUsersfromFeed = new Set();
        allConnections.forEach((req) => {
            if (req.status === 'blocked') {
                hideUsersfromFeed.add(req.fromUserID.toString());
                hideUsersfromFeed.add(req.toUserID.toString());
            } else {
                hideUsersfromFeed.add(req.fromUserID.toString());
                hideUsersfromFeed.add(req.toUserID.toString());
            }
        });
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
        });
    } catch (error) {
        console.error('Error in /user/feed:', error.message);
        res.status(401).json({ message: 'Error inside the userRouter feed' });
    }
      
})

userRouter.get('/user/mutualConnections/:id', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const userId = req.params.id;

        // Fetch logged-in user's connections
        const loggedInUserConnections = await ConnectionRequest.find({
            $or: [
                { fromUserID: loggedInUser._id, status: 'accepted' },
                { toUserID: loggedInUser._id, status: 'accepted' }
            ]
        }).select('fromUserID toUserID');

        const loggedInUserConnectionsSet = new Set(
            loggedInUserConnections.map(connection =>
                connection.fromUserID.toString() === loggedInUser._id.toString()
                    ? connection.toUserID.toString()
                    : connection.fromUserID.toString()
            )
        );

        // Fetch the other user's connections
        const userConnections = await ConnectionRequest.find({
            $or: [
                { fromUserID: userId, status: 'accepted' },
                { toUserID: userId, status: 'accepted' }
            ]
        }).select('fromUserID toUserID');

        const userConnectionsSet = new Set(
            userConnections.map(connection =>
                connection.fromUserID.toString() === userId
                    ? connection.toUserID.toString()
                    : connection.fromUserID.toString()
            )
        );

        // Find mutual connections
        const mutualConnectionIds = Array.from(loggedInUserConnectionsSet).filter(id =>
            userConnectionsSet.has(id)
        );

        // Fetch mutual connection details
        const mutualConnections = await User.find({
            _id: { $in: mutualConnectionIds }
        }).select(["firstName", "lastName", "photoURL", "about", "skills", "age"]);

        return res.status(200).json({
            message: 'Mutual connections fetched successfully',
            data: mutualConnections
        });
    } catch (error) {
        console.error('Error in /user/mutualConnections:', error.message);
        res.status(500).json({ message: 'Error fetching mutual connections' });
    }
});
     
userRouter.post('user/block/:id', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const userId = req.params.id;

        // Check if the user is already blocked
        const existingBlock = await ConnectionRequest.findOne({
            $or: [
                { fromUserID: loggedInUser._id, toUserID: userId, status: 'blocked' },
                { fromUserID: userId, toUserID: loggedInUser._id, status: 'blocked' }
            ]
        });

        if (existingBlock) {
            return res.status(400).json({ message: 'User is already blocked' });
        }

        // Block the user
        const blockRequest = new ConnectionRequest({
            fromUserID: loggedInUser._id,
            toUserID: userId,
            status: 'blocked'
        });

        await blockRequest.save();

        return res.status(200).json({
            message: 'User blocked successfully',
            data: blockRequest
        });
    } catch (error) {
        console.error('Error in /user/block:', error.message);
        res.status(500).json({ message: 'Error blocking user' });
    }
});

module.exports = userRouter;