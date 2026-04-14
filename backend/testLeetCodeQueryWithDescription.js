const fetch = require('node-fetch');
(async ()=>{
  const query = `query questionData($titleSlug: String!){ question(titleSlug: $titleSlug){questionId title titleSlug difficulty likes dislikes categoryTitle content description stats acRate codeSnippets { lang langSlug code }}}`;
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST', headers:{'Content-Type':'application/json','Referer':'https://leetcode.com'},
      body: JSON.stringify({query, variables:{titleSlug:'two-sum'}})
    });
    const json = await res.json();
    console.log('status', res.status);
    console.log(JSON.stringify(json,null,2));
  } catch (err) {
    console.error('error', err);
  }
})();