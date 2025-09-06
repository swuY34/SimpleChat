# SimpleChat

A modern, real-time chat application built with React (Electron) frontend and Spring Boot backend, featuring WebSocket communication for instant messaging.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using WebSocket connections
- **Multi-Channel Support**: Create and join different chat channels
- **User Authentication**: Secure registration and login with JWT tokens
- **Desktop Application**: Cross-platform desktop app built with Electron
- **Modern UI**: Clean and responsive interface using Ant Design
- **Message Persistence**: All messages are stored in MySQL database
- **User Management**: User registration, login, and password management
- **System Notifications**: Join/leave notifications for better user experience

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: React 19 with TypeScript
- **Desktop**: Electron 37.2.0
- **UI Library**: Ant Design 5.26.4
- **Styling**: UnoCSS + Tailwind CSS
- **Build Tools**: Webpack, Electron Forge
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### Backend (Server)
- **Framework**: Spring Boot 3.5.3
- **Language**: Java 21
- **Database**: MySQL with JPA/Hibernate
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: WebSocket
- **Build Tool**: Maven
- **ORM**: Spring Data JPA

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Java 21** or higher
- **Maven** 3.6+
- **MySQL** 8.0+

## 🚦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/swuY34/SimpleChat.git
cd SimpleChat
```

### 2. Database Setup
1. Start your MySQL server
2. Create a database named `SimpleChat_db`:
```sql
CREATE DATABASE SimpleChat_db;
```
3. Update database credentials in `server/src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/SimpleChat_db
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. Backend Setup
```bash
cd server
mvn clean install
mvn spring-boot:run
```
The server will start on `http://localhost:8888`

### 4. Frontend Setup
```bash
cd client
npm install
npm start
```
This will launch the Electron desktop application.

## 🏗️ Architecture Overview

### Database Schema
The application uses the following main entities:

#### Users Table
- `user_id` (UUID, Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password_hash`
- `created_at`

#### Channels Table
- `channel_id` (UUID, Primary Key)
- `channel_name`
- `created_by` (Foreign Key to Users)
- `created_at`
- `last_message_time`

#### Messages Table
- `message_id` (Auto-increment, Primary Key)
- `channel_id` (Foreign Key to Channels)
- `sender_id` (Foreign Key to Users)
- `content` (Text)
- `sent_at`
- `status` (SENT, DELIVERED, READ)

#### Channel Members Table
- `channel_id` (Foreign Key to Channels)
- `user_id` (Foreign Key to Users)
- `joined_at`

### API Endpoints

#### User Management
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user info
- `POST /api/users/change-password` - Change password

#### Channel Management
- `GET /api/channels` - Get user's channels
- `POST /api/channels` - Create new channel
- `GET /api/channels/{channelId}` - Get channel details
- `POST /api/channels/{channelId}/join` - Join channel
- `DELETE /api/channels/{channelId}/leave` - Leave channel

#### Message Management
- `GET /api/messages/{channelId}` - Get channel messages
- `POST /api/messages` - Send message (also via WebSocket)

#### WebSocket Endpoints
- `ws://localhost:8888/ws/chat/{channelId}?username={username}` - Real-time chat

## 🎮 Usage

### 1. First Time Setup
1. Start the backend server
2. Launch the desktop application
3. Register a new account or login with existing credentials

### 2. Creating/Joining Channels
- Click on "Create Channel" to create a new chat room
- Use "Join Channel" to enter existing channels
- Channel names must be unique

### 3. Chatting
- Select a channel from the sidebar
- Type your message in the input field
- Press Enter or click Send to send messages
- Messages appear in real-time for all channel members

### 4. User Management
- View your profile information
- Change your password through the settings
- Logout when finished

## 🔧 Development

### Project Structure
```
SimpleChat/
├── client/                 # Electron + React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api/           # API service functions
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   ├── package.json
│   └── webpack configs
├── server/                # Spring Boot backend
│   ├── src/main/java/com/simplechat/
│   │   ├── controller/    # REST controllers
│   │   ├── entity/        # JPA entities
│   │   ├── repository/    # Data repositories
│   │   ├── service/       # Business logic
│   │   ├── config/        # Configuration classes
│   │   └── utils/         # Utility classes
│   └── pom.xml
└── README.md
```

### Running in Development Mode

#### Backend (with auto-reload)
```bash
cd server
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev"
```

#### Frontend (with hot reload)
```bash
cd client
npm run start
```

### Building for Production

#### Backend
```bash
cd server
mvn clean package
java -jar target/FinalProject-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
cd client
npm run make
```

## 🔐 Security Features

- **Password Hashing**: Passwords are hashed using SHA-256 with username as salt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **Session Management**: Automatic token expiration and refresh
- **CORS Protection**: Configured for secure cross-origin requests

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `application.properties`
   - Verify database exists

2. **WebSocket Connection Failed**
   - Check if backend server is running on port 8888
   - Verify firewall settings
   - Ensure CORS is properly configured

3. **Build Errors**
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - For Maven: `mvn clean install`

4. **Electron App Won't Start**
   - Check Node.js version compatibility
   - Rebuild native dependencies: `npm rebuild`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add unit tests for new features
- Update documentation when necessary
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**swuY** - [GitHub Profile](https://github.com/swuY34)

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React and Electron communities
- Ant Design for the beautiful UI components
- All contributors who help improve this project

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed description
4. Contact the maintainer

---

**Happy Chatting! 💬**