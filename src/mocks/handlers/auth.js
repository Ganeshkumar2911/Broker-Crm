import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'
import urls from '../../api/urls'

import { mockPermissions } from '../data/permissionsData'

export const authHandlers = [
  // 1. Mock Login API
  http.post('/api' + urls.auth.login, async ({ request }) => {
    const body = await request.json()
    const { email, password } = body

    if (email !== 'admin@tech4broker.com' || password !== 'Broker@123') {
      return new HttpResponse(
        JSON.stringify({
          success: false,
          message: "Invalid email or password."
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        access_token: 'dummy-jwt-token-ey123456789',
        role: 'superadmin',
        user: {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: 'admin@tech4broker.com',
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
        email: 'admin@tech4broker.com',
        role: 'Super Admin',
        phone_number: faker.phone.number(),
        date_of_birth: faker.date.birthdate({ min: 30, max: 60, mode: 'age' }).toISOString().split('T')[0],
        country: 'US',
        state: faker.location.state(),
        city: faker.location.city(),
        address: faker.location.streetAddress(),
        zip_code: faker.location.zipCode(),
        created_at: faker.date.past({ years: 2 }).toISOString().split('T')[0]
      }
    })
  }),

  // 4. Mock Update Profile
  http.put('/api' + (urls?.auth?.updateProfile || '/user/update_profile') + '/:id', async ({ request }) => {
    return HttpResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })
  }),

  // 5. Mock RBAC Permissions to bypass "Access Restricted" screen
  http.get('/api' + urls.rbac.userPermissions.me, () => {
    return HttpResponse.json(mockPermissions)
  })
]
