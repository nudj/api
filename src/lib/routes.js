module.exports = (server) => {
  server.get('/jobs/:jid', (req, res) => {
    // fetch job from db
    let job = {
      "id": 1,
      "title": "Quos sequi",
      "status": "Open",
      "bonus": 77,
      "description": "Molestiae placeat saepe eligendi earum excepturi et laudantium fuga. Sed corporis voluptatem dolores esse soluta et. Magnam aut atque dolores voluptatibus ut occaecati iusto laborum.",
      "type": "Freelance",
      "remuneration": 36,
      "tags": [
        "deleniti",
        "dolorem",
        "quibusdam"
      ],
      "location": "Ebbamouth",
      "companyId": 3,
      "company": {
        "id": 3,
        "industry": "IT",
        "location": "Grantstad",
        "logo": "http://www.companyfolders.com/blog/media/2015/01/apple-300x300.jpg",
        "name": "Deckow LLC",
        "size": "Start up",
        "url": "http://www.Rau.info/"
      }
    }
    // return job in res
    res.json(job)
  })
}
