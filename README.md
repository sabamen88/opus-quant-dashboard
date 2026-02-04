# Opus Quant Dashboard

Real-time trading dashboard for Futures and Soccer O/U analysis powered by 8-LLM consensus.

## Features

- **Futures Trading Tab**: Real-time Stage 1/2 signals, LLM health monitoring
- **Soccer O/U Tab**: Daily picks with confidence scores and performance tracking
- **Real-time Updates**: Supabase subscriptions for live data
- **LLM Health Matrix**: Monitor all 8 models in the quant panel

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase (real-time database)
- Recharts (charts)

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your Supabase credentials
4. Run development server: `npm run dev`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

Deploy to Vercel:
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

## Architecture

The dashboard connects to Supabase tables populated by Tasklet AI workflows:
- `session_analysis` - Futures trading signals (Stage 1 & 2)
- `model_predictions` - Soccer O/U predictions
- `futures_trade_results` - Trade outcomes for performance tracking

---

Built with ❤️ by Tasklet AI for Opus Quant Department