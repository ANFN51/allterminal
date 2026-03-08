import yahooFinance from 'yahoo-finance2';
console.log(typeof yahooFinance.quote);
yahooFinance.quote('AAPL').then(q => console.log(q.symbol)).catch(console.error);
