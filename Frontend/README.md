# BaaS Platform Frontend

Modern React frontend for the BaaS platform with dark theme, animations, and responsive design.

## Features

- 🎨 **Dark Theme** - Beautiful dark theme with colorful accents
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- ✨ **Smooth Animations** - Powered by Framer Motion
- 🔐 **Authentication** - Login, Register, and protected routes
- 🗄️ **Cluster Management** - Create and manage database clusters
- 📊 **Dashboard** - Overview of clusters and statistics
- 🎯 **Redux State Management** - Centralized state with Redux Toolkit
- 🔄 **API Integration** - Axios with automatic token refresh

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Redux Toolkit** - State management
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Setup

### 1. Install Dependencies

```bash
cd Frontend
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
Frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout/       # Layout components (Header, Sidebar)
│   │   └── Modals/       # Modal components
│   ├── pages/            # Page components
│   │   ├── Auth/        # Login, Register
│   │   ├── Dashboard/   # Dashboard page
│   │   └── Clusters/    # Cluster management
│   ├── store/            # Redux store
│   │   ├── slices/      # Redux slices
│   │   └── store.js     # Store configuration
│   ├── services/         # API services
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── index.html
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Color Scheme

- **Background**: `#0a0a0a` (Dark)
- **Surface**: `#111111` (Darker)
- **Card**: `#1a1a1a` (Card background)
- **Border**: `#2a2a2a` (Borders)
- **Text**: `#e0e0e0` (Primary text)
- **Accent Colors**: Blue, Purple, Pink, Green, Orange

## Features in Detail

### Authentication
- Login with email/password
- Registration with validation
- Protected routes
- Automatic token refresh
- Logout functionality

### Dashboard
- Overview statistics
- Recent clusters
- Quick actions
- Responsive grid layout

### Cluster Management
- Create clusters
- List all clusters
- View cluster details
- Delete clusters
- Search functionality

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Collapsible sidebar on mobile
- Touch-friendly interactions

## API Integration

The frontend connects to the API Gateway at `http://localhost:3000/api`:

- `/api/auth/*` - Authentication endpoints
- `/api/db/*` - Database/Cluster endpoints

## Development Tips

1. **Hot Reload**: Changes are automatically reflected
2. **Redux DevTools**: Install Redux DevTools extension for debugging
3. **Responsive Testing**: Use browser dev tools to test different screen sizes
4. **API Errors**: Check browser console and network tab for API issues

## Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

