 Listen to in-game events
    contract.on("MatchResult", (winner, tokenId, amount) => {
      const event = {
        type: "TOKEN_WIN",
        value: amount,
        player: winner,
        description: `Fighter #${tokenId} won ${amount} tokens`
      }
      setImpactEvents(prev => [...prev, event])
      quantumSimulator.processGameEvent(event)
    })
    
    return () => contract.removeAllListeners()
  }, [wallet.connected])

  return (
    <div className="border-t pt-4 mt-6">
      <h3 className="font-bold text-lg">CryptoClashers Live Events</h3>
      <div className="max-h-60 overflow-y-auto">
        {impactEvents.map((event, idx) => (
          <div key={idx} className="p-2 hover:bg-gray-50">
            <div className="font-medium">{event.description}</div>
            <div className="text-sm text-green-600">
              +{event.value.toLocaleString()} $WYO
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```
