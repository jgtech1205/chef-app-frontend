# Chef en Place - Frontend Application

A modern, responsive web application for restaurant management and chef collaboration, built with React, TypeScript, and Vite.

## 🚀 Features

- **User Authentication & Authorization** - Secure login system with role-based access control
- **Recipe Management** - Create, edit, and organize recipes with AI-powered ingredient extraction
- **Panel Management** - Organize recipes into customizable panels for different meal services
- **Team Collaboration** - Manage team members and assign roles within restaurants
- **Real-time Notifications** - Stay updated with important alerts and announcements
- **Multi-language Support** - English and Spanish localization
- **Responsive Design** - Optimized for desktop and mobile devices
- **PWA Ready** - Progressive Web App capabilities for mobile users

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **UI Components**: Custom components with Lucide React icons
- **Payment Integration**: Stripe
- **Admin Panel**: React Admin
- **Internationalization**: Custom i18n solution

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jgtech1205/chef-app-frontend.git
   cd chef-app-frontend/chefenplace-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   - Copy `env-setup.txt` to `.env`
   - Update the environment variables with your configuration

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run generate-pwa-assets` - Generate PWA assets

## 🌐 Environment Variables

Create a `.env` file with the following variables:

```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_API_URL=your_backend_api_url
```

## 📱 PWA Features

The application includes Progressive Web App capabilities:
- Offline support
- Installable on mobile devices
- Push notifications (when configured)

## 🎨 Design System

- **Color Palette**: Professional slate grays with warm accent colors
- **Typography**: Clean, readable fonts optimized for kitchen environments
- **Components**: Consistent UI components following modern design principles

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Secure API communication
- Environment variable protection

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

For internal development team use only. Please follow the established coding standards and review process.

## 📞 Support

For technical support or questions, please contact the development team.
