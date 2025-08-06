# QR Mate - Web Application

A modern networking application built with Next.js and TypeScript that allows users to connect with people through QR codes.

## Features

- QR Code generation and scanning
- User profile management
- Network connections
- Event management
- Modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: TanStack Query
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd QrMate
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
   - Copy the `env.local` file to `.env.local`
   - Or create a `.env.local` file with the content from `env.local`

4. Start your backend server:
   - Make sure your backend is running on `localhost:8000`
   - If using Docker, start your backend container

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── [routes]/          # Dynamic routes
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── pages/                 # Page components
├── styles/                # Global styles
└── types/                 # TypeScript type definitions
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME=QR Mate
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Configuration
NODE_ENV=development
```

**Note**: Make sure your backend server is running on `localhost:8000` before starting the frontend.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
