useEffect(() => {
  fetch('/api/scanner')
    .then(r => r.json())
    .then(data => setToken(data));
}, []);
