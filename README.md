# SimpleChat

A modern real-time chat application built with Spring Boot backend and Electron desktop client.

## 📋 Overview

SimpleChat is a full-stack chat application that provides real-time messaging capabilities through WebSocket connections. The application consists of two main components:

- **Server**: Spring Boot REST API with WebSocket support
- **Client**: Electron desktop application with React UI

## 🏗️ Architecture

```
SimpleChat/
├── server/          # Spring Boot backend (Java 21)
│   ├── src/main/java/com/simplechat/
│   │   ├── controller/     # REST API controllers
│   │   ├── service/        # Business logic services
│   │   ├── entity/         # JPA entities
│   │   ├── repository/     # Data access layer
│   │   ├── config/         # Configuration classes
│   │   └── utils/          # Utility classes
│   └── pom.xml            # Maven dependencies
└── client/         # Electron desktop app
    ├── src/
    │   ├── api/           # API communication layer
    │   ├── globalStyle/   # Global CSS styles
    │   └── config/        # Client configuration
    └── package.json       # Node.js dependencies
```

## ✨ Features

- 🔐 **User Authentication**: JWT-based authentication system
- 💬 **Real-time Messaging**: WebSocket-powered instant messaging
- 🏢 **Channel Management**: Create and manage chat channels
- 👥 **User Management**: User registration and profile management
- 🖥️ **Desktop Application**: Cross-platform Electron app
- 🎨 **Modern UI**: React with Ant Design components
- 📱 **Responsive Design**: UnoCSS for flexible styling

## 🛠️ Tech Stack

### Backend (Server)
- **Java 21**
- **Spring Boot 3.5.3**
- **Spring WebSocket** - Real-time communication
- **Spring Data JPA** - Database operations
- **MySQL** - Database
- **JWT** - Authentication
- **Maven** - Dependency management

### Frontend (Client)
- **Electron** - Desktop application framework
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Ant Design** - UI component library
- **UnoCSS** - Utility-first CSS framework
- **Webpack** - Module bundler
- **Axios** - HTTP client

## 🚀 Getting Started

### Prerequisites

- **Java 17** or higher
- **Node.js 18** or higher
- **MySQL 8.0** or higher
- **Maven 3.6** or higher

### Database Setup

1. Install and start MySQL
2. Create a database for the application:
```sql
CREATE DATABASE SimpleChat_db;
```

### Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Configure database connection in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/SimpleChat_db
spring.datasource.username=root
spring.datasource.password=your_password
server.port=8888
```

3. Install dependencies and run:
```bash
# Make Maven wrapper executable (if needed)
chmod +x mvnw

# Build and run the application
./mvnw clean install
./mvnw spring-boot:run
```

The server will start on `http://localhost:8888`

### Client Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. For production build:
```bash
npm run make
```

## 📡 API Endpoints

### Authentication & Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/{userId}/channels` - Get user's channels

### Channels
- `GET /api/channels` - Get all channels
- `POST /api/channels` - Create new channel
- `GET /api/channels/{id}` - Get channel details
- `POST /api/channels/{channelId}/members` - Add member to channel
- `GET /api/channels/{channelId}/messages` - Get channel messages

### Messages
- `POST /api/channels/{channelId}/messages` - Send message

### WebSocket
- `/ws/chat` - WebSocket endpoint for real-time messaging

## 🔧 Development

### Running Tests

**Server:**
```bash
cd server
./mvnw test
```

**Client:**
```bash
cd client
npm test
```

### Code Style

**Server:**
- Follow Java conventions
- Use Lombok for boilerplate code reduction

**Client:**
- ESLint configuration included
- TypeScript for type safety
- Follow React best practices

### Building for Production

**Server:**
```bash
cd server
./mvnw clean package
```

**Client:**
```bash
cd client
npm run make
```

## 📁 Project Structure

### Key Files

- `server/src/main/java/com/simplechat/FinalProjectApplication.java` - Main Spring Boot application
- `server/src/main/java/com/simplechat/config/WebSocketConfig.java` - WebSocket configuration
- `client/src/index.html` - Main HTML file
- `client/src/renderer.ts` - Electron renderer process
- `client/package.json` - Client dependencies and scripts

### Database Entities

- **User**: User account information
- **Channel**: Chat channel details
- **Message**: Chat messages
- **ChannelMember**: Channel membership mapping

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- **swuY** - [GitHub Profile](https://github.com/swuY34)

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- Electron team for cross-platform desktop apps
- React and Ant Design communities
- All contributors and users of this project

---

For more information or support, please open an issue in the GitHub repository.