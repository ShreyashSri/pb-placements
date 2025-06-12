# Point Blank Talent Portal

A modern student talent discovery platform built with Next.js 13, Supabase, and AI-powered resume parsing. This platform allows students to upload their resumes, create profiles, and enables recruiters to discover talent through an intuitive directory interface.

## 🚀 Features

- **AI-Powered Resume Parsing**: Automatically extracts skills, experience, and achievements from PDF resumes using Google's Gemini AI
- **Student Profiles**: Comprehensive profiles with skills, experience, achievements, and links
- **Smart Directory**: Search and filter students by domain, year, skills, and more
- **Export Capabilities**: Export student data in multiple formats (PDF, JSON, email lists)
- **Authentication**: Secure authentication with Supabase Auth
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Works seamlessly across all devices
- **Dark/Light Mode**: Theme switching support

## 🛠 Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Generative AI (Gemini)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **PDF Processing**: pdf-parse, pdf-lib
- **OCR**: Tesseract.js
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📋 Prerequisites

Before setting up the project, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account and project
- A Google AI API key (for Gemini)

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=supabase_database_url
# Google AI API Key (for resume parsing)
GOOGLE_AI_KEY=your_google_ai_api_key
```

### Required Environment Variables Explained:

1. **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL (found in Project Settings > API)
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anonymous key (found in Project Settings > API)
3. **DATABASE_URL**: The database URL you get from supabase
4. **GOOGLE_AI_KEY**: Google AI API key for Gemini (get from Google AI Studio)

### Setting up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the above SQL commands to create the required tables
4. Enable Row Level Security (RLS) if needed
5. Copy your project URL and anon key to your `.env.local` file

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pb-placements
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

### Project Structure
```
├── app/                    # Next.js 13 app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── directory/         # Student directory
│   ├── profile/           # Profile pages
│   └── upload/            # Resume upload flow
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── home/             # Homepage components
│   ├── directory/        # Directory components
│   └── profile/          # Profile components
├── lib/                  # Utility libraries
│   ├── db.ts             # Database operations
│   ├── resume-parser.ts  # AI resume parsing
│   └── utils.ts          # General utilities
└── hooks/                # Custom React hooks
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### API Endpoints

- `GET /api/init` - Initialize database tables
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/members` - Get all members
- `GET /api/directory/search` - Search members
- `POST /api/achievements` - Create achievement
- `POST /api/experiences` - Create experience
- `POST /api/links` - Create link
- `GET /api/export/json` - Export as JSON
- `GET /api/export/pdf` - Export as PDF
- `GET /api/export/email` - Export email list

## 🔒 Authentication

The application uses Supabase Auth for authentication:

- OAuth providers can be configured in Supabase dashboard
- Protected routes are handled by middleware
- Session management is automatic
## 📄 Resume Parsing

The AI-powered resume parser:
- Extracts text from PDF files using `pdf-parse`
- Uses Google's Gemini AI for intelligent parsing
- Automatically identifies skills, experience, achievements
- Handles various resume formats and layouts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check that all environment variables are set correctly
2. Ensure your Supabase database tables are created
3. Verify your Google AI API key is valid
4. Check the console for any error messages

For additional help, please open an issue in the repository.

Make sure to set the environment variables in your deployment platform.
