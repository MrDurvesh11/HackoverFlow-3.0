"use client"

import { useState } from "react"
import { X, Save, AlertCircle } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function StrategySettingsModal({ open, onOpenChange, strategyName, strategyType, initialParams }) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  
  // Default parameters if none provided
  const defaultParams = {
    timeFrame: "4h",
    riskLevel: "medium",
    maxPosition: 10000,
    stopLoss: 2.5,
    takeProfit: 5.0,
    trailingStop: false,
    indicators: {
      rsi: {
        enabled: true,
        period: 14,
        overbought: 70,
        oversold: 30
      },
      macd: {
        enabled: true,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
      },
      bollingerBands: {
        enabled: false,
        period: 20,
        deviation: 2
      }
    }
  }
  
  const [params, setParams] = useState(initialParams || defaultParams)
  
  const handleSubmit = () => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)
      // Here you would normally handle the successful update
    }, 1500)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-card border-border/40">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Strategy Settings: {strategyName || "Strategy"}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full" 
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Configure parameters for your {strategyType || "trading"} strategy
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-background/50 border border-border/40">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 py-4">
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timeFrame">Time Frame</Label>
                <Select 
                  value={params.timeFrame} 
                  onValueChange={(value) => setParams({...params, timeFrame: value})}
                >
                  <SelectTrigger id="timeFrame" className="bg-background/50 border-border/40">
                    <SelectValue placeholder="Select time frame" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5m">5 Minutes</SelectItem>
                    <SelectItem value="15m">15 Minutes</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="4h">4 Hours</SelectItem>
                    <SelectItem value="1d">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select 
                  value={params.riskLevel} 
                  onValueChange={(value) => setParams({...params, riskLevel: value})}
                >
                  <SelectTrigger id="riskLevel" className="bg-background/50 border-border/40">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="maxPosition">Max Position Size ($)</Label>
                <span className="text-sm text-muted-foreground">${params.maxPosition.toLocaleString()}</span>
              </div>
              <Slider 
                id="maxPosition"
                value={[params.maxPosition]} 
                min={1000} 
                max={50000} 
                step={1000}
                onValueChange={(value) => setParams({...params, maxPosition: value[0]})}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="stopLoss">Stop Loss (%)</Label>
                <span className="text-sm text-muted-foreground">{params.stopLoss}%</span>
              </div>
              <Slider 
                id="stopLoss"
                value={[params.stopLoss]} 
                min={0.5} 
                max={10} 
                step={0.5}
                onValueChange={(value) => setParams({...params, stopLoss: value[0]})}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="takeProfit">Take Profit (%)</Label>
                <span className="text-sm text-muted-foreground">{params.takeProfit}%</span>
              </div>
              <Slider 
                id="takeProfit"
                value={[params.takeProfit]} 
                min={1} 
                max={20} 
                step={0.5}
                onValueChange={(value) => setParams({...params, takeProfit: value[0]})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="trailingStop">Trailing Stop</Label>
                <div className="text-sm text-muted-foreground">Dynamically adjust stop loss as price moves</div>
              </div>
              <Switch 
                id="trailingStop" 
                checked={params.trailingStop}
                onCheckedChange={(checked) => setParams({...params, trailingStop: checked})}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 py-4">
            <Alert className="bg-amber-500/10 text-amber-500 border-amber-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Changing advanced settings may significantly impact strategy performance.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxOpenTrades">Max Open Trades</Label>
                <Input 
                  id="maxOpenTrades" 
                  type="number" 
                  defaultValue="3"
                  className="bg-background/50 border-border/40" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="orderType">Order Type</Label>
                <Select defaultValue="market">
                  <SelectTrigger id="orderType" className="bg-background/50 border-border/40">
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                    <SelectItem value="stop">Stop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxDrawdown">Max Drawdown (%)</Label>
                <Input 
                  id="maxDrawdown" 
                  type="number" 
                  defaultValue="15"
                  className="bg-background/50 border-border/40" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profitTarget">Daily Profit Target (%)</Label>
                <Input 
                  id="profitTarget" 
                  type="number" 
                  defaultValue="3"
                  className="bg-background/50 border-border/40" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rebalancingPeriod">Portfolio Rebalancing Period</Label>
              <Select defaultValue="weekly">
                <SelectTrigger id="rebalancingPeriod" className="bg-background/50 border-border/40">
                  <SelectValue placeholder="Select rebalancing period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pyramiding">Position Pyramiding</Label>
                <div className="text-sm text-muted-foreground">Add to position as trade moves favorably</div>
              </div>
              <Switch id="pyramiding" />
            </div>
          </TabsContent>
          
          <TabsContent value="indicators" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="border border-border/40 rounded-md p-4 bg-background/30">
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="rsiEnabled" className="font-medium">RSI</Label>
                  <Switch 
                    id="rsiEnabled" 
                    checked={params.indicators.rsi.enabled}
                    onCheckedChange={(checked) => 
                      setParams({
                        ...params, 
                        indicators: {
                          ...params.indicators,
                          rsi: {
                            ...params.indicators.rsi,
                            enabled: checked
                          }
                        }
                      })
                    }
                  />
                </div>
                
                <div className="grid gap-4 grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="rsiPeriod" className="text-sm">Period</Label>
                    <Input 
                      id="rsiPeriod" 
                      type="number" 
                      value={params.indicators.rsi.period}
                      onChange={(e) => 
                        setParams({
                          ...params, 
                          indicators: {
                            ...params.indicators,
                            rsi: {
                              ...params.indicators.rsi,
                              period: parseInt(e.target.value)
                            }
                          }
                        })
                      }
                      className="bg-background/50 border-border/40 h-8" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rsiOverbought" className="text-sm">Overbought</Label>
                    <Input 
                      id="rsiOverbought" 
                      type="number" 
                      value={params.indicators.rsi.overbought}
                      onChange={(e) => 
                        setParams({
                          ...params, 
                          indicators: {
                            ...params.indicators,
                            rsi: {
                              ...params.indicators.rsi,
                              overbought: parseInt(e.target.value)
                            }
                          }
                        })
                      }
                      className="bg-background/50 border-border/40 h-8" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rsiOversold" className="text-sm">Oversold</Label>
                    <Input 
                      id="rsiOversold" 
                      type="number" 
                      value={params.indicators.rsi.oversold}
                      onChange={(e) => 
                        setParams({
                          ...params, 
                          indicators: {
                            ...params.indicators,
                            rsi: {
                              ...params.indicators.rsi,
                              oversold: parseInt(e.target.value)
                            }
                          }
                        })
                      }
                      className="bg-background/50 border-border/40 h-8" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="border border-border/40 rounded-md p-4 bg-background/30">
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="macdEnabled" className="font-medium">MACD</Label>
                  <Switch 
                    id="macdEnabled" 
                    checked={params.indicators.macd.enabled}
                    onCheckedChange={(checked) => 
                      setParams({
                        ...params, 
                        indicators: {
                          ...params.indicators,
                          macd: {
                            ...params.indicators.macd,
                            enabled: checked
                          }
                        }
                      })
                    }
                  />
                </div>
                
                <div className="grid gap-4 grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="macdFast" className="text-sm">Fast Period</Label>
                    <Input 
                      id="macdFast" 
                      type="number" 
                      value={params.indicators.macd.fastPeriod}
                      onChange={(e) => 
                        setParams({
                          ...params, 
                          indicators: {
                            ...params.indicators,
                            macd: {
                              ...params.indicators.macd,
                              fastPeriod: parseInt(e.target.value)
                            }
                          }
                        })
                      }
                      className="bg-background/50 border-border/40 h-8" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="macdSlow" className="text-sm">Slow Period</Label>
                    <Input 
                      id="macdSlow" 
                      type="number" 
                      value={params.indicators.macd.slowPeriod}
                      onChange={(e) => 
                        setParams({
                          ...params, 
                          indicators: {
                            ...params.indicators,
                            macd: {
                              ...params.indicators.macd,
                              slowPeriod: parseInt(e.target.value)
                            }
                          }
                        })
                      }
                      className="bg-background/50 border-border/40 h-8" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="macdSignal" className="text-sm">Signal Period</Label>
                    <Input 
                      id="macdSignal" 
                      type="number" 
                      value={params.indicators.macd.signalPeriod}
                      onChange={(e) => 
                        setParams({
                          ...params, 
                          indicators: {
                            ...params.indicators,
                            macd: {
                              ...params.indicators.macd,
                              signalPeriod: parseInt(e.target.value)
                            }
                          }
                        })
                      }
                      className="bg-background/50 border-border/40 h-8" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="border border-border/40 rounded-md p-4 bg-background/30">
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="bbEnabled" className="font-medium">Bollinger Bands</Label>
                  <Switch 
                    id="bbEnabled" 
                    checked={params.indicators.bollingerBands.enabled}
                    onCheckedChange={(checked) => 
                      setParams({
                        ...params, 
                        indicators: {
                          ...params.indicators,
                          bollingerBands: {
                            ...params.indicators.bollingerBands,
                            enabled: checked
                          }
                        }
                      })
                    }
                  />
                </div>
                
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bbPeriod" className="text-sm">Period</Label>
                    <Input 
                      id="bbPeriod" 
                      type="number" 
                      value={params.indicators.bollingerBands.period}
                      onChange={(e) => 
                        setParams({
                          ...params, 
                          indicators: {
                            ...params.indicators,
                            bollingerBands: {
                              ...params.indicators.bollingerBands,
                              period: parseInt(e.target.value)
                            }
                          }
                        })
                      }
                      className="bg-background/50 border-border/40 h-8" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bbDeviation" className="text-sm">Standard Deviation</Label>
                    <Input 
                      id="bbDeviation" 
                      type="number" 
                      value={params.indicators.bollingerBands.deviation}
                      onChange={(e) => 
                        setParams({
                          ...params, 
                          indicators: {
                            ...params.indicators,
                            bollingerBands: {
                              ...params.indicators.bollingerBands,
                              deviation: parseFloat(e.target.value)
                            }
                          }
                        })
                      }
                      className="bg-background/50 border-border/40 h-8" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Changes
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}