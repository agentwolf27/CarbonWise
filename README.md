# CarbonWise - AI-Driven Carbon Footprint Tracking

A modern, responsive web application built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Prisma** for tracking and reducing your carbon footprint with automated Chrome extension tracking.

## 🌐 Live Website

**🚧 Live Website Coming Soon! 🚧**

We're currently working on deploying CarbonWise to production. The live website will be available at [carbonwise.com](https://carbonwise.com) soon. In the meantime, you can run the project locally using the installation instructions below.

**Current Status**: ✅ Development Complete | 🔄 Deployment In Progress

## 🌱 Features

### ✅ Implemented Features
- **🔐 User Authentication** - Secure login with Google OAuth and NextAuth.js
- **📊 Personal Dashboard** - Real-time carbon tracking with interactive analytics
- **📈 Manual Activity Logging** - Add carbon activities like travel, food, energy consumption
- **🎯 Goal Setting & Progress Tracking** - Set sustainability goals and track achievements
- **🏆 Achievement System** - Unlock badges for reaching sustainability milestones
- **👥 Account Types** - Individual and Business account support
- **🔌 Chrome Extension** - Automated carbon tracking for online activities
- **🛍️ E-commerce Tracking** - Amazon purchases automatically tracked
- **🏨 Travel Tracking** - Hotel bookings (Booking.com, Expedia, Kayak)
- **🚗 Transportation Tracking** - Uber/Lyft rides automatically detected
- **🍕 Food Delivery Tracking** - DoorDash, Uber Eats, Grubhub orders
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **💾 SQLite Database** - Reliable local database with Prisma ORM

### 🔄 In Development
- **✈️ Flight Tracking** - Enhanced flight carbon calculations
- **🏢 Business Team Management** - Company dashboards and team features
- **🤖 AI-Powered Insights** - Personalized sustainability recommendations
- **📧 Email Notifications** - Progress updates and achievement notifications

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Styling**: Tailwind CSS with custom design system
- **Chrome Extension**: Manifest V3 with background service workers
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel deployment

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

⚠️ **Security Notice**: Never commit API keys or secrets to the repository!

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual credentials in `.env.local`:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_SECRET="your-secure-random-string"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-oauth-client-id"
   GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
   ```

3. Generate a secure NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```

See `SECURITY.md` for complete security setup instructions.

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

## 🏗️ Architecture

### Web Application
- **Frontend**: Next.js 15 with React and TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with JWT tokens

### Chrome Extension
- **Manifest**: V3 for modern Chrome extension standards
- **Background**: Service worker for API communication
- **Content Scripts**: Automatic activity detection on supported websites
- **Popup**: Modern React-like interface for user interaction
- **Security**: Secure OAuth flow with JWT token management

### Supported Websites for Auto-Tracking
- **E-commerce**: Amazon
- **Travel**: Booking.com, Expedia, Kayak
- **Transportation**: Uber, Lyft
- **Food Delivery**: DoorDash, Uber Eats, Grubhub

## 🤖 **AI-Enhanced Carbon Tracking**

CarbonWise now features intelligent activity classification powered by **DeepSeek V3** via OpenRouter:

- **Smart Activity Detection**: Automatically classifies web activities (streaming, search, social media, AI interaction, etc.)
- **Carbon Intensity Assessment**: Evaluates impact as LOW/MEDIUM/HIGH based on resource usage and user interaction
- **Personalized Insights**: AI-generated recommendations for reducing your digital carbon footprint
- **Real-time Emission Factors**: Integration with Climatiq API for accurate regional electricity data

### AI Models Used:
- **Primary**: DeepSeek V3 (via OpenRouter) - Cost-effective and high-performance
- **Fallback**: Basic rule-based classification system
- **Future**: Support for multiple AI providers through OpenRouter
