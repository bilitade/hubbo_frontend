# RBAC Frontend

A modern, scalable React frontend for Role-Based Access Control (RBAC) system built with **Vite**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui** components.

## 🚀 Features

- ✅ **Modern Stack**: Vite + React 18 + TypeScript
- ✅ **Styling**: Tailwind CSS with shadcn/ui components
- ✅ **Theme Support**: Light/Dark mode with system preference detection
- ✅ **Authentication**: JWT-based auth with automatic token refresh
- ✅ **Routing**: React Router v6 with protected routes
- ✅ **API Integration**: Complete RBAC API client with all endpoints
- ✅ **Feature Modules**: Users, Roles, Permissions, AI Assistant, File Management
- ✅ **Responsive Design**: Mobile-first approach with adaptive sidebar
- ✅ **Type Safety**: Full TypeScript coverage with API types
- ✅ **Scalable Architecture**: Feature-based folder structure

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (Button, Card, Input, etc.)
│   └── layout/         # Layout components (Header, Sidebar, Layout)
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state management
│   └── ThemeContext.tsx # Theme management
├── features/           # Feature modules
│   ├── auth/          # Authentication (Login, Register, ProtectedRoute)
│   ├── users/         # User management (Dashboard, UsersPage)
│   ├── roles/         # Role management
│   ├── permissions/   # Permission management
│   ├── ai/            # AI Assistant integration
│   └── files/         # File upload/management
├── services/          # API clients and services
│   └── api.ts         # Complete API client with all endpoints
├── types/             # TypeScript type definitions
│   └── api.ts         # API types from OpenAPI spec
├── lib/               # Utility functions
│   └── utils.ts       # Helper functions (cn, etc.)
├── App.tsx            # Main app with routing
└── main.tsx           # Application entry point
```

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (custom implementation)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context API

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fronend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Theme System

The application supports three theme modes:
- **Light**: Light color scheme
- **Dark**: Dark color scheme  
- **System**: Automatically follows OS preference

Toggle theme using the sun/moon icon in the header.

## 🔐 Authentication

The app uses JWT-based authentication with:
- Access tokens (short-lived)
- Refresh tokens (long-lived with rotation)
- Automatic token refresh on 401 responses
- Protected routes requiring authentication

### Login Flow
1. User enters credentials at `/login`
2. API returns access + refresh tokens
3. Tokens stored in localStorage
4. Access token sent with each request
5. Automatic refresh when access token expires

## 📱 Features Overview

### Dashboard
- User profile overview
- Account status and approval state
- Assigned roles and permissions
- Quick stats

### Users Management
- List all users
- View user details
- Approve pending users
- Delete users
- View assigned roles

### Roles Management
- List all roles
- View role permissions
- Delete roles

### Permissions Management
- List all permissions
- Delete permissions

### AI Assistant
- Chat with AI
- Generate ideas
- Enhance content
- Auto-fill suggestions
- Document search

### File Management
- Upload files
- List uploaded files
- Download files
- Delete files

## 🌐 API Integration

The API client (`src/services/api.ts`) provides methods for all RBAC endpoints:

### Authentication
- `login(email, password)`
- `logout()`
- `refreshToken()`

### Users
- `register(data)`
- `createUser(data)`
- `listUsers(skip, limit)`
- `getCurrentUser()`
- `updateCurrentUser(data)`
- `getUser(userId)`
- `updateUser(userId, data)`
- `deleteUser(userId)`
- `approveUser(userId)`

### Roles
- `createRole(data)`
- `listRoles(skip, limit)`
- `getRole(roleId)`
- `updateRole(roleId, data)`
- `deleteRole(roleId)`

### Permissions
- `createPermission(data)`
- `listPermissions(skip, limit)`
- `getPermission(permissionId)`
- `deletePermission(permissionId)`

### AI Assistant
- `chat(data)`
- `generateIdea(data)`
- `enhanceContent(data)`
- `autoFill(data)`
- `searchDocuments(data)`
- `listModels()`

### Files
- `uploadFile(file, category, index)`
- `listFiles(category)`
- `downloadFile(relativePath)`
- `deleteFile(relativePath)`
- `adminListFiles(userId, category)`

## 🎯 Best Practices

- **Type Safety**: All API responses are typed
- **Error Handling**: Comprehensive error handling in API client
- **Code Organization**: Feature-based folder structure
- **Component Reusability**: Shared UI components
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Semantic HTML and ARIA labels
- **Performance**: Code splitting with React.lazy (can be added)

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   ```

3. **Deploy** the `dist` folder to your hosting provider:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and structure.

## 📧 Support

For issues or questions, please open an issue in the repository.
