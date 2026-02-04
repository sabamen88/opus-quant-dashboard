'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Signal = {
  id: string
  symbol: string
  direction: string
  entry: number
  tp: number
  sl: number
  quality: string
  consensus: string
  session: string
  created_at: string
}

type SoccerPick = {
  id: string
  match: string
  league: string
  prediction: string
  line: number
  confidence: number
  consensus: string
  result?: string
  created_at: string
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'futures' | 'soccer'>('futures')
  const [signals, setSignals] = useState<Signal[]>([])
  const [picks, setPicks] = useState<SoccerPick[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    
    // Real-time subscription for futures signals
    const signalsSub = supabase
      .channel('signals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_analysis' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      signalsSub.unsubscribe()
    }
  }, [])

  async function fetchData() {
    setLoading(true)
    
    // Fetch futures signals
    const { data: signalsData } = await supabase
      .from('session_analysis')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (signalsData) setSignals(signalsData)

    // Fetch soccer picks
    const { data: picksData } = await supabase
      .from('model_predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (picksData) setPicks(picksData)
    
    setLoading(false)
  }

  const getQualityBadge = (quality: string) => {
    const badges: Record<string, string> = {
      'FIRE': '🔥 FIRE',
      'STRONG': '⚡ STRONG',
      'GOOD': '✅ GOOD',
      'WEAK': '⚠️ WEAK'
    }
    return badges[quality] || quality
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Opus Quant Dashboard</h1>
        <p className="text-gray-400">Real-time trading signals powered by 8-LLM consensus</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('futures')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'futures'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📈 Futures Trading
        </button>
        <button
          onClick={() => setActiveTab('soccer')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'soccer'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          ⚽ Soccer O/U
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading data...</p>
        </div>
      )}

      {/* Futures Tab */}
      {!loading && activeTab === 'futures' && (
        <div className="space-y-6">
          {/* Latest Signals */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Latest Signals</h2>
            <div className="grid gap-4">
              {signals.length === 0 ? (
                <p className="text-gray-400">No signals yet. Waiting for market open...</p>
              ) : (
                signals.slice(0, 5).map((signal) => (
                  <div key={signal.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <span className="text-lg font-bold">{signal.symbol}</span>
                      <span className={`ml-3 px-2 py-1 rounded text-sm ${
                        signal.direction === 'LONG' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {signal.direction}
                      </span>
                      <span className="ml-3 text-gray-400">{signal.session}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        Entry: {signal.entry} | TP: {signal.tp} | SL: {signal.sl}
                      </div>
                      <div className="mt-1">
                        <span className="text-yellow-400">{getQualityBadge(signal.quality)}</span>
                        <span className="ml-3 text-gray-400">{signal.consensus}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LLM Health */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🤖 LLM Health Status</h2>
            <div className="grid grid-cols-4 gap-3">
              {['DeepSeek V3.2', 'Kimi K2.5', 'Qwen3 235B', 'GLM-4.7', 'MiniMax M2.1', 'ERNIE-4.5', 'Llama 4', 'DeepSeek Prover'].map((model) => (
                <div key={model} className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-green-400">●</div>
                  <div className="text-sm mt-1">{model}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Soccer Tab */}
      {!loading && activeTab === 'soccer' && (
        <div className="space-y-6">
          {/* Today's Picks */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">⚽ Today's O/U Picks</h2>
            <div className="grid gap-4">
              {picks.length === 0 ? (
                <p className="text-gray-400">No picks yet. Analysis runs before match day...</p>
              ) : (
                picks.slice(0, 5).map((pick) => (
                  <div key={pick.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold">{pick.match}</span>
                        <span className="ml-3 text-gray-400 text-sm">{pick.league}</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded font-semibold ${
                          pick.prediction === 'OVER' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {pick.prediction} {pick.line}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-sm text-gray-400">
                      <span>Confidence: {pick.confidence}%</span>
                      <span>Consensus: {pick.consensus}</span>
                      {pick.result && (
                        <span className={pick.result === 'WIN' ? 'text-green-400' : 'text-red-400'}>
                          {pick.result}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Performance</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">--</div>
                <div className="text-gray-400 text-sm mt-1">Win Rate</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">--</div>
                <div className="text-gray-400 text-sm mt-1">Total Picks</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">--</div>
                <div className="text-gray-400 text-sm mt-1">ROI</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Opus Quant Dashboard v1.0 • Powered by 8-LLM Consensus + Monte Carlo
      </div>
    </div>
  )
}