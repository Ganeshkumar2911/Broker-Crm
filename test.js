fetch('http://localhost:60035/api/cashback/enrollments?status=active&offset=0&limit=50', {
  headers: {
    'Authorization': 'Bearer test'
  }
}).then(r => r.json()).then(console.log).catch(console.error)
