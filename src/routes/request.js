const express = require("express");
const requestRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/userSchema");

const { userAuth } = require("../midleware/auth");

requestRouter.post("/request/send/:status/:toUserID", userAuth, async (req, res) => {
    
    

    try{
         const fromUserID = req.user._id;
         const toUserID = req.params.toUserID;
         const status = req.params.status;
         
         const allowedStatus = ["ignore", "interested"];

         if(!allowedStatus.includes(status))
         {
            res.status(404).json({message : "Invalid status type :" + status});
         }

         const user = await User.findById(toUserID);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

         const existingConnection = await ConnectionRequest.findOne({
            $or : [
                {fromUserID , toUserID},   
                {fromUserID: toUserID, toUserID: fromUserID}
            ]
         })

         if(existingConnection)
         {
            return res.status(404).json({message : "Connection request already exists"});
         }

         if(fromUserID == toUserID)
         {
            return res.status(404).json({message : "You cannot send connection request to yourself"});
         }

         const connectionRequest = await ConnectionRequest({
             fromUserID,
             toUserID,
             status
         });

         const data = await connectionRequest.save();

         return res.status(200).json({
             message: "Connection request sent successfully",
             data
         });    
       
    }catch(error){
        console.error('Error in /request/send/interested:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }

    res.send(user.firstName + " sent the connect request!");
});

module.exports = requestRouter;
