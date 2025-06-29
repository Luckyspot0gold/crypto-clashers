**1. Crypto Data Pipelines:**  
```python
# Google Cloud Function: crypto_loader.py
import requests
from google.cloud import bigquery

def load_crypto_data(request):
    # CoinMarketCap
    cmc = requests.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
                      headers={'X-CMC_PRO_API_KEY': os.getenv('CMC_KEY')})
    bq_client.load_table_from_json(cmc.json(), 'market_data.cmc_listings')
    
    # CoinStats
    cs = requests.get('https://openapiv1.coinstats.app/coins',
                     headers={'X-API-KEY': os.getenv('COINSTATS_KEY')})
    bq_client.load_table_from_json(cs.json(), 'market_data.coinstats')
    
    # Base Chain
    base = requests.get('https://api.base.org/chain-data')
    bq_client.load_table_from_json(base.json(), 'market_data.base_chain')
    
    return "Data loaded", 200
```
