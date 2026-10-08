import { http, HttpResponse } from 'msw'
import { getLatestWithdrawals } from '../data/pammData'

export const pammHandlers = [
  // Intercept GET requests to /api/pamm/withdrawals
  http.get('/api/pamm/withdrawals', () => {
    return HttpResponse.json(getLatestWithdrawals())
  }),

  // You can also mock POST, PUT, DELETE requests here
  // http.post('/api/pamm/withdrawals/:id/approve', ({ params }) => { ... })
]
