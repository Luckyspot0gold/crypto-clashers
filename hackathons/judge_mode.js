javascript
   // Add to main App.js
   if (new URLSearchParams(window.location.search).has('judge')) {
     enableJudgeFeatures({
       infiniteFunds: true,
       aiDebugMode: true,
       skipTutorials: true
     });
   }
   ```
