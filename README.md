# IntroFuse

IntroFuse is an AI-powered web application that helps broadcast radio DJs create compelling song introduction scripts by connecting current content with the emotional essence of songs. 

## Features

### Phase 1 (MVP) - Completed ✅

- **User Authentication**: Role-based access control (Station User, Station Admin, Super Admin)
- **Content Input**: Support for URL extraction, file uploads, and manual content entry
- **Song Analysis**: AI-powered analysis of songs using Claude API
- **Script Generation**: Creates 5-10 second and 15-20 second introduction scripts
- **Writing Styles**: Four preset styles (Humorous, Casual, Thoughtful, Storytelling)
- **Content Filtering**: FCC compliance and broadcast standards enforcement
- **Export Options**: Copy to clipboard and download as text files
- **Responsive Design**: 16:9 aspect ratio layout optimized for various screen sizes

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI**: Shadcn/ui components with Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Claude API (Sonnet 4)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Claude API key from Anthropic

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/introfuse.git
   cd introfuse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your values:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Claude API Configuration
   CLAUDE_API_KEY=your_claude_api_key

   # Next.js Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   Run the migration SQL in your Supabase SQL editor:
   ```bash
   # Copy the contents of supabase/migrations/001_initial_schema.sql
   # and run it in your Supabase project's SQL editor
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main tables:

- **users**: User profiles with role-based permissions
- **stations**: Radio station information
- **custom_styles**: User-created custom writing styles
- **songs**: Cached song analyses for performance
- **content_sessions**: Historical content and script generation sessions

## API Endpoints

### Authentication
- All endpoints require authentication
- Role-based access control enforced

### Main Endpoints
- `POST /api/generate-scripts` - Generate intro scripts
- `POST /api/extract-url` - Extract content from URLs

## Usage

### For DJs (Station Users)

1. **Sign up/Login** with your radio station credentials
2. **Import Content** via URL, file upload, or manual entry
3. **Enter Song Details** (artist and title)
4. **Select Writing Style** (Humorous, Casual, Thoughtful, or Storytelling)
5. **Generate Scripts** - AI creates both 5-10 second and 15-20 second versions
6. **Review & Export** - Copy to clipboard or download as text files

### For Station Admins

- All DJ features plus:
- Manage custom styles for their station
- View other users' content within their station

### For Super Admins

- All features plus:
- Cross-station access
- Claude model switching (Sonnet ↔ Opus)
- System-wide management

## Content Guidelines

IntroFuse enforces strict content filtering to ensure FCC compliance:

- ✅ **Allowed**: Current events, entertainment news, sports, technology, lifestyle content
- ❌ **Filtered**: Explicit content, discriminatory language, extreme political content, profanity

## Performance Features

- **Song Analysis Caching**: Previously analyzed songs are stored for instant retrieval
- **Optimized API Usage**: Efficient Claude API calls with error handling
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant feedback and progress indicators

## Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Ensure all environment variables from `.env.local` are set in your deployment platform.

## Roadmap

### Phase 2 (Enhanced Features)
- [ ] Custom style creation from transcript analysis
- [ ] Style guide editing interface
- [ ] Prompt-guided regeneration
- [ ] Enhanced UI with tooltips and notifications
- [ ] Usage analytics dashboard

### Phase 3 (Scaling & Monetization)
- [ ] Subscription management system
- [ ] Usage tracking and billing
- [ ] Advanced analytics and reporting
- [ ] Multi-document export options
- [ ] Performance optimizations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database and auth by [Supabase](https://supabase.com/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
