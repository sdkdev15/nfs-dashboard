# nfs-dashboard-backend

## Overview
The nfs-dashboard-backend project is a Node.js application built with TypeScript that provides authentication functionalities for the NFS Dashboard. It includes features such as user registration, login, and two-factor authentication.

## Project Structure
```
nfs-dashboard-backend
├── src
│   ├── controllers         # Contains controllers for handling requests
│   │   └── authController.ts
│   ├── routes              # Defines the routes for the application
│   │   └── authRoutes.ts
│   ├── services            # Contains business logic for authentication
│   │   └── authService.ts
│   ├── models              # Defines the data models
│   │   └── userModel.ts
│   ├── middlewares         # Middleware functions for authentication
│   │   └── authMiddleware.ts
│   ├── utils               # Utility functions
│   │   └── tokenUtil.ts
│   └── app.ts              # Entry point of the application
├── package.json            # NPM configuration file
├── tsconfig.json           # TypeScript configuration file
└── README.md               # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd nfs-dashboard-backend
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the application, run:
```
npm start
```

## API Endpoints
- **POST /api/auth/login**: Authenticate a user and return a token.
- **POST /api/auth/register**: Register a new user.
- **POST /api/auth/two-factor**: Set up or verify two-factor authentication.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License.