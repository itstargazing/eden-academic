# EDEN - Academic Tools Platform

EDEN is an AI-powered platform designed to enhance academic research and study experience. Our suite of tools helps researchers and students optimize their workflow and boost productivity.

## Features

- **MindMap Translator**: Convert complex texts into visual mind maps
- **Focus Soundscapes**: Ambient sound mixer for optimal concentration
- **Thesis Sculptor**: AI-assisted thesis writing and structuring
- **Cognitive Compass**: Personalized study strategy recommendations
- **StudyTime Sync**: Collaborative study session coordination
- **Ghost Citations**: Automated citation management
- **Syllabus Whisperer**: Course material analysis and organization

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- NextAuth.js
- Framer Motion
- Chart.js
- D3.js

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd eden-academic
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add the following variables:
```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
# Add OAuth credentials if using social login
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Deploy on Vercel (Recommended)

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI:
```bash
npm i -g vercel
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts to complete deployment

### Environment Variables

Make sure to set up the following environment variables in your deployment platform:

- `NEXTAUTH_SECRET`: Your authentication secret key
- `NEXTAUTH_URL`: Your production URL
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

### Custom Domain Setup

1. Add your domain in Vercel dashboard
2. Configure DNS settings as per Vercel's instructions
3. Wait for SSL certificate provisioning (automatic with Vercel)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

[Your chosen license]

## Support

For support, please [create an issue](your-repo-issues-url) or contact our team at [your-support-email].
