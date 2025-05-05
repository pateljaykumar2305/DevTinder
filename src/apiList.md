💡 DevTinder APIs

### 🔐 Authentication
- **POST** `/signup`  
    Create a new user account.

- **POST** `/login`  
    Authenticate a user and start a session.

- **POST** `/logout`  
    End the current user session.

### 👤 Profile
- **GET** `/profile/view`  
    Retrieve the details of the user's profile.

- **PATCH** `/profile/edit`  
    Update the user's profile information.

- **PATCH** `/profile/password`  
    Change the user's password.

### 💌 Requests
- **POST** `/request/send/interested/:userId`  
    Send an "interested" request to a user.

- **POST** `/request/send/ignored/:userId`  
    Send an "ignored" request to a user.

### ✅ Request Review
- **POST** `/request/review/accepted/:requestId`  
    Accept a received request.

- **POST** `/request/review/rejected/:requestId`  
    Reject a received request.

### 🔗 Connections & Feed
- **GET** `/connections`  
    Retrieve the list of connected users.

- **GET** `/requests/received`  
    View the list of received requests.

- **GET** `/feed`  
    Retrieve profiles of other users on the platform.

### 📌 Status Types
- `ignore`, `interested`, `accepted`, `rejected`