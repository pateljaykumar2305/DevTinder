const adminAuth = ('/admin', (req, res, next) => {

    console.log('Authorization middleware');

    const token = "1234";
    if(token !== '1234') {
        return res.status(401).json({ message: 'Unauthorized' });
    }   
    else{
        next();
    }
});

const userAuth = ('/user', (req, res, next) => {
    console.log('User authorization middleware');

    const userToken = 'user-1234';
    console.log(userToken);
    if (!userToken || userToken !== 'user-1234') {
        return res.status(403).json({ message: 'Forbidden: Invalid or missing token' });
    } else {
        next();
    }
});

module.exports = {adminAuth , userAuth};