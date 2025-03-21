export function MarketNews() {
  const news = [
    {
      title: "Fed signals potential rate cuts in coming months",
      time: "2 hours ago",
      source: "Financial Times",
    },
    {
      title: "Tech stocks rally as inflation data shows cooling",
      time: "4 hours ago",
      source: "Bloomberg",
    },
    {
      title: "Bitcoin volatility increases amid regulatory concerns",
      time: "6 hours ago",
      source: "CoinDesk",
    },
    {
      title: "Major bank earnings exceed analyst expectations",
      time: "8 hours ago",
      source: "CNBC",
    },
    {
      title: "New AI trading algorithms show promising results",
      time: "10 hours ago",
      source: "TechCrunch",
    },
  ]

  return (
    <div className="space-y-4">
      {news.map((item, index) => (
        <div key={index} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
          <h3 className="font-medium hover:text-blue-400 cursor-pointer transition-colors">{item.title}</h3>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{item.time}</span>
            <span>{item.source}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

