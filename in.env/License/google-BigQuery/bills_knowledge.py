 Hugging Face Sentiment Analysis:**  
```python
# sentiment_analyzer.py
from transformers import pipeline
from supabase import create_client

sentiment_pipeline = pipeline('sentiment-analysis', 
                              model='cardiffnlp/twitter-roberta-base-sentiment')

def analyze_tweets():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    unsorted = supabase.table('bill_knowledge').select('*').eq('sentiment_score', None).execute()
    
    for row in unsorted.data:
        result = sentiment_pipeline(row['content']['text'])
        score = convert_to_score(result)  # [-1, 1] scale
        supabase.table('bill_knowledge').update({'sentiment_score': score}).eq('id', row['id']).execute()
```
