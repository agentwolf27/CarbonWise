# CarbonWise - AI-Driven Carbon Footprint Tracking

A modern, responsive web application built with **Next.js 15**, **TypeScript**, and **Tailwind CSS** for tracking and reducing digital carbon footprints.

## 🌱 Features

- **Real-time Carbon Tracking** - Monitor your digital carbon footprint across all activities
- **AI-Powered Insights** - Get personalized recommendations based on machine learning
- **Interactive Dashboard** - Comprehensive analytics and data visualization
- **Goal Setting & Progress Tracking** - Set sustainability goals and track achievements
- **Team Collaboration** - Work together to achieve collective sustainability goals
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Animations**: CSS animations and transitions
- **Deployment**: Ready for Vercel/Netlify

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/carbonwise.git
   cd carbonwise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Color Palette
- **Primary Green**: `#8cd279` - Main brand color
- **Dark Background**: `#171f14` - Primary background
- **Card Background**: `#222e1f` - Card and component backgrounds
- **Border**: `#2f402b` - Borders and dividers
- **Muted Text**: `#a4be9d` - Secondary text color

### Typography
- **Primary Font**: Manrope
- **Fallback**: Noto Sans, sans-serif

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── contact/           # Contact page  
│   ├── dashboard/         # Dashboard page
│   ├── features/          # Features page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── Footer.tsx         # Footer component
│   └── Navigation.tsx     # Navigation component
└── public/               # Static assets
```

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🎯 Pages

### Home Page (`/`)
- Hero section with main value proposition
- Feature highlights
- Statistics and social proof
- Call-to-action sections

### About Page (`/about`)
- Company mission and values
- Development timeline
- Team information
- Company values

### Features Page (`/features`)
- Detailed feature descriptions
- Integration capabilities
- Team collaboration tools
- Pricing information

### Dashboard Page (`/dashboard`)
- Real-time carbon tracking
- Interactive charts and analytics
- Goal progress tracking
- Recent activities
- Quick actions

### Contact Page (`/contact`)
- Contact form with validation
- Company contact information
- FAQ section
- Team contact details

## 🔧 Configuration

### Tailwind CSS
Custom configuration in `tailwind.config.ts` includes:
- Custom color palette
- Extended animations
- Custom utility classes
- Responsive breakpoints

### Next.js
- App Router for modern routing
- TypeScript for type safety
- Optimized for production builds
- SEO-friendly metadata

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Netlify
1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify

### Manual Deployment
1. Build: `npm run build`
2. Start: `npm run start`

## 🌍 Environment Variables

Create a `.env.local` file for environment variables:

```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## 🎨 Customization

### Colors
Update the color palette in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    green: '#your-color',
  },
  carbon: {
    dark: '#your-dark-color',
    // ... other colors
  }
}
```

### Fonts
Add custom fonts in `src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont');
```

## 📱 Responsive Design

- **Mobile First**: Designed with mobile users in mind
- **Breakpoints**: Tailwind's responsive system
- **Touch Friendly**: Optimized for touch interactions
- **Fast Loading**: Optimized images and lazy loading

## 🔍 SEO Features

- Meta tags and Open Graph
- Structured data
- Semantic HTML
- Fast loading times
- Accessible design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@carbonwise.com
- **Documentation**: [docs.carbonwise.com](https://docs.carbonwise.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/carbonwise/issues)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons
- Vercel for hosting and deployment

---

**CarbonWise** - Making sustainability accessible through technology 🌱
