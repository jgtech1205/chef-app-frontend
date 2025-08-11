# Portfolio Website

A modern, responsive portfolio website built with Next.js, TypeScript, and Tailwind CSS. Perfect for software engineers to showcase their projects, skills, and experience.

## 🚀 Features

- **Modern Design**: Clean, professional layout with dark mode support
- **Responsive**: Optimized for desktop, tablet, and mobile devices
- **Interactive Navigation**: Smooth scrolling between sections
- **Project Showcase**: Dedicated sections for featured and regular projects
- **Skills Display**: Organized skill categories with modern styling
- **Image Gallery**: Filterable project gallery with categories
- **Contact Form**: Functional contact form with validation
- **SEO Optimized**: Built with Next.js for optimal performance

## 🏗️ Built With

- [Next.js 14](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React Icons](https://react-icons.github.io/react-icons/) - Icons

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view the website.

## ✏️ Customization Guide

### 1. Personal Information

Update the following components with your information:

**Navigation (`src/components/Navigation.tsx`)**:
- Change "Your Name" to your actual name

**Hero Section (`src/components/Hero.tsx`)**:
- Update name, title, and description
- Add your profile image

**About Section (`src/components/About.tsx`)**:
- Modify the about text
- Update experience and education details

**Contact Section (`src/components/Contact.tsx`)**:
- Update email, location, and social media links
- Customize contact form submission handling

### 2. Projects

**Update Projects (`src/components/Projects.tsx`)**:
- Replace the sample projects with your actual projects
- Add your Vercel deployment URLs
- Include project screenshots
- Update technologies used

### 3. Skills

**Modify Skills (`src/components/Skills.tsx`)**:
- Update the skill categories and individual skills
- Adjust colors and styling as needed

### 4. Gallery

**Add Your Images (`src/components/Gallery.tsx`)**:
- Add project images to the `public` folder
- Update image paths in the gallery data
- Organize projects by categories

### 5. Images

**Add Your Assets**:
- Place your images in the `public` folder
- For profile photo: `public/profile.jpg`
- For project screenshots: `public/projects/project-name.jpg`
- Optimize images for web (recommended: WebP format, max 1200px width)

### 6. Styling

**Customize Colors**:
- Modify Tailwind colors in `tailwind.config.js`
- Update brand colors throughout the components

## 📱 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically with each push

### Other Deployment Options

- **Netlify**: Connect GitHub repository
- **GitHub Pages**: Use `npm run build` and deploy the `out` folder
- **AWS S3**: Build static files and upload to S3

## 🎨 Design Customization

### Color Scheme
- Primary: Blue (#2563eb)
- Secondary: Gray variations
- Accent: Depends on section (green, purple, orange)

### Typography
- Font: System fonts (optimized for performance)
- Headings: Bold, large sizes
- Body: Regular weight, readable line height

### Layout
- Max width: 6xl (1152px)
- Padding: Responsive (4-8px on mobile, up to 32px on desktop)
- Sections: 80px vertical padding

## 📋 TODO for You

1. **Replace placeholder content** with your actual information
2. **Add your project images** to the public folder
3. **Update project URLs** with your Vercel deployments
4. **Customize social media links** in the contact section
5. **Add your profile photo** for the hero section
6. **Test on different devices** to ensure responsiveness
7. **Set up contact form** with a service like Formspree or EmailJS
8. **Add Google Analytics** for tracking (optional)

## 📖 Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
└── components/
    ├── About.tsx        # About section
    ├── Contact.tsx      # Contact form & info
    ├── Gallery.tsx      # Project gallery
    ├── Hero.tsx         # Landing section
    ├── Navigation.tsx   # Header navigation
    ├── Projects.tsx     # Featured projects
    └── Skills.tsx       # Skills showcase
```

## 🤝 Contributing

Feel free to fork this project and customize it for your own use! If you make improvements, consider sharing them back with the community.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy coding! 🚀**

*Need help customizing your portfolio? Feel free to reach out or check the Next.js documentation for advanced features.*