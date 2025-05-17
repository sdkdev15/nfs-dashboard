# NFS Dashboard Backend

This is the backend application for the NFS Dashboard, built to manage and monitor Network File System (NFS) resources.

## Features

- User authentication and management.
- File upload, retrieval, and deletion.
- RESTful API for frontend integration.

## Prerequisites

- Go 1.16+
- Docker (for containerization)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/nfs-dashboard-backend.git
   cd nfs-dashboard-backend
   ```

2. Run the docker build and docker run:

   ```bash
   docker build -t nfs-dashboard-backend .
   ```

   ```bash
   docker run -p 8080:8080 nfs-dashboard-backend
   ```

## Usage

1. Start the application using Docker.
2. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Build for Production

To create a production build, run:
```bash
docker build -t nfs-dashboard-backend .
```

The build artifacts will be stored in the specified directory.

## Contributing

Contributions are welcome! Please follow the contribution guidelines.

## License

This project is licensed under the MIT License.

## Contact

For any inquiries or support, please contact [your-email@example.com](mailto:sdkdev15@gmail.com).