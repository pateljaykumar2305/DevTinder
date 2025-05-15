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


requestRouter.post("/request/view/:status/:requestID", userAuth, async (req, res) => {

    // Get the logged-in user from the request
     // Rohit -> MsDhoni
    //  loggendInUser -> touserID
    // check status is interested
    // Check Rohit is logged in or not
    // Check if the request is already accepted or rejected
    
    //console.log('Request body:', req.body);
   
    try{
        const loggedInUser = req.user;
        console.log('Logged-in user:', loggedInUser);
        const { status , requestID } = req.params;
        console.log('Request ID:', requestID);
        console.log('Status:', status);
    
        const allowedStatus = ["accepted", "rejected"];
        if(!allowedStatus.includes(status))
        {
            res.status(404).json({message : "status type should not be the :" + status});
        }
        const connectionRequest = await ConnectionRequest.findOne({
            fromUserID: loggedInUser._id,
            toUserID: requestID,
            status: "interested"
        })

        if(!connectionRequest)
        {
            return res.status(404).json({message : "Connection request not found"});
        }

        connectionRequest.status = status;
        
        const data = await connectionRequest.save();

        return res.status(200).json({
            message: "Connection request accepted successfully",
            data
        });

    }
    catch(error){
        console.error('Error in /request/view/accept:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
     
})
module.exports = requestRouter;
