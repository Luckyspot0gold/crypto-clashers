`jsx
// Bill's Saloon Dashboard
<Card className="saloon-card">
  <CardHeader>
    <Avatar className="w-16 h-16">
      <AvatarImage src="/bill.png" alt="Bar Keep Bill" />
    </Avatar>
    <div>
      <CardTitle>Bar Keep Bill's Market Watch</CardTitle>
      <CardDescription>Est. 1852 • Whiskey & Wisdom</CardDescription>
    </div>
  </CardHeader>
  <CardContent>
    <Tabs defaultValue="crypto">
      <TabsList>
        <TabsTrigger value="crypto">Crypto Gold</TabsTrigger>
        <TabsTrigger value="land">Virtual Land</TabsTrigger>
        <TabsTrigger value="gossip">Saloon Gossip</TabsTrigger>
      </TabsList>
      {/* Interactive content panels */}
    </Tabs>
  </CardContent>
</Card>
```
