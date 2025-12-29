# Inktoons - Comics & News for Pi Network

Inktoons is a premium entertainment portal in the Pi Network ecosystem. Read comics, novels, and stay updated with the latest news while earning Pi.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Deployment

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete deployment instructions.

## ✨ Features

- **Pi Network SDK Integration**: Secure authentication and payments
- **Premium Content**: High-quality comics and novels
- **Cloud Persistence**: Supabase for database and image storage
- **Micro-donations**: Support your favorite authors with Pi tips
- **Responsive Design**: Optimized for the Pi Browser and mobile devices
- **Real-time Updates**: Live content updates across all users

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Storage**: [Supabase Storage](https://supabase.com/storage)
- **Hosting**: [Vercel](https://vercel.com/)

## 💰 Cost Breakdown (100% FREE for MVP)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Vercel | Hobby | $0/mes | 100GB bandwidth |
| Supabase | Free | $0/mes | 500MB DB + 1GB Storage |
| **TOTAL** | | **$0/mes** | Perfect for Testnet |

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Complete deployment guide
- [Database Schema](./supabase-schema.sql) - Supabase SQL schema
- [Environment Variables](./ENVIRONMENT_SETUP.md) - Required env vars

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_PI_API_KEY=your_pi_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

## 📄 License

MIT

