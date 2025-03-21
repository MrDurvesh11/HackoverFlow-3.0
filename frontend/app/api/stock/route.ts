import yahooFinance from 'yahoo-finance2';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get the URL to extract search params
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const interval = searchParams.get('interval') || '1mo'; // Default to '1mo'
    
    if (!ticker) {
      return NextResponse.json(
        { error: "Ticker symbol is required" },
        { status: 400 }
      );
    }
    
    // Ensure the interval is one of the allowed values
    if (!['1d', '1w', '1mo', '3m', '1y'].includes(interval)) {
      return NextResponse.json(
        { error: "Invalid interval. Use '1d', '1w', '1mo', '3m', or '1y'." },
        { status: 400 }
      );
    }
    
    // Map the UI time range values to Yahoo Finance intervals and ranges
    const rangeMap = {
      "1d": { interval: "5m", range: "1d" },
      "1w": { interval: "60m", range: "5d" },
      "1mo": { interval: "1d", range: "1mo" },
      "3m": { interval: "1d", range: "3mo" },
      "1y": { interval: "1wk", range: "1y" }
    };
    
    // Use the chart API instead of historical
    const data = await yahooFinance.chart(ticker, {
      period1: '2021-05-08',
      interval: '1d'
    });
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}