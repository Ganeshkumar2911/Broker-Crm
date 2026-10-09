import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'
import urls from '../../api/urls'

import { mockPermissions } from '../data/permissionsData'

export const authHandlers = [
  // 1. Mock Login API
  http.post('/api' + urls.auth.login, async ({ request }) => {
    // You could read the email/password here if you wanted to validate it:
    // const { email, password } = await request.json()

    // But for a dummy demo, we can just accept any login and return a fake token
    return HttpResponse.json({
      success: true,
      data: {
        access_token: 'dummy-jwt-token-ey123456789',
        role: 'superadmin',
        user: {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: 'admin@panthercapital.com',
          role: 'superadmin',
          avatar: faker.image.avatar()
        }
      },
      message: "Login successful"
    })
  }),

  // 2. Mock Logout API (Optional)
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true, message: "Logged out successfully" })
  }),

  // 3. Mock "Get Current User" API (often called on page reload to check session)
  http.get('/api' + urls.auth.profile, ({ request }) => {
    // Check if the frontend sent the token in the headers
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 }) // Unauthorized
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: 'user-123',
        name: 'Admin User',
        email: 'admin@panthercapital.com',
        role: 'Super Admin'
      }
    })
  }),

  // 4. Mock RBAC Permissions to bypass "Access Restricted" screen
  http.get('/api' + urls.rbac.userPermissions.me, () => {
    return HttpResponse.json(mockPermissions)
  })
]
