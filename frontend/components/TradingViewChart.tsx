"use client"

import { useEffect, useRef } from 'react'

interface TradingViewChartProps {
  symbol: string
  isStock?: boolean
}

export function TradingViewChart({ symbol, isStock = true }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const script = document.createElement('script')
      script.innerHTML = `
        new TradingView.widget({
          "autosize": true,
          "symbol": "${isStock ? symbol : 'BINANCE:' + symbol}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "withdateranges": true,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "details": true,
          "hotlist": true,
          "calendar": true,
          "container_id": "${containerRef.current.id}",
          "show_popup_button": true,
          "popup_width": "1000",
          "popup_height": "650",
          "studies": [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies"
          ]
        });
      `
      containerRef.current.appendChild(script)
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, isStock])

  return <div id={`tradingview_${symbol}`} ref={containerRef} className="h-full w-full" />
}