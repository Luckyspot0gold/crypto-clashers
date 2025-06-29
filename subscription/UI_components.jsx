`jsx
// File: SubscriptionCard.jsx
export const SubscriptionCard = ({ plan }) => (
  <div className="subscription-card wanted-poster">
    <div className="header">
      <h3>{plan.name.toUpperCase()}</h3>
      <div className="price">
        {plan.price > 0 ? `$${plan.price}/mo` : 'FREE'}
      </div>
    </div>
    
    <ul className="features">
      {plan.features.map((feature, index) => (
        <li key={index}>
          <span className="checkmark">✔</span> 
          {feature.replace(/_/g, ' ')}
        </li>
      ))}
    </ul>
    
    {plan.whiskey_bonus > 0 && (
      <div className="whiskey-bonus">
        + {plan.whiskey_bonus} Whiskey Wisdom Tokens
      </div>
    )}
    
    <button className="subscribe-button brass">
      {plan.price > 0 ? 'CLAIM YOUR LAND' : 'JOIN THE RUSH'}
    </button>
  </div>
)
```
