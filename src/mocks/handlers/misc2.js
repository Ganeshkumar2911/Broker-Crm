import { http, HttpResponse } from 'msw'
import urls from '../../api/urls'
import { faker } from '@faker-js/faker'

function paginate(items, page, perPage) {
  const start = (page - 1) * perPage
  const end = start + perPage
  return items.slice(start, end)
}

export const misc2Handlers = [
  // ---------------------------------------------------------
  // ENHANCED AUDIT LOGS
  // ---------------------------------------------------------
  http.get('/api' + urls.enhancedAuditLogs.list, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const perPage = parseInt(url.searchParams.get('per_page')) || 10
    
    const totalItems = 35
    const allLogs = Array.from({ length: totalItems }).map((_, i) => ({
      id: faker.number.int({ min: 10000, max: 99999 }),
      module: faker.helpers.arrayElement(['CRM', 'WALLET', 'TRADING', 'USERS']),
      action: faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE', 'LOGIN']),
      status: faker.helpers.arrayElement(['SUCCESS', 'FAILED', 'PENDING']),
      summary: faker.lorem.sentence(),
      actor: {
        id: faker.number.int({ min: 1, max: 100 }),
        type: 'ADMIN',
        name: faker.person.fullName(),
        email: faker.internet.email()
      },
      entity: {
        id: faker.number.int({ min: 1000, max: 5000 }),
        type: 'USER'
      },
      request_context: {
        ip_address: faker.internet.ip(),
        user_agent: faker.internet.userAgent()
      },
      created_at: faker.date.recent().toISOString()
    }))

    return HttpResponse.json({
      status: 'success',
      data: paginate(allLogs, page, perPage),
      pagination: { page, per_page: perPage, total_items: totalItems, total_pages: Math.ceil(totalItems/perPage) }
    })
  }),

  http.get('/api/audit-logs/:id/details', ({ params }) => {
    const id = Number(params.id) || faker.number.int({ min: 10000, max: 99999 })
    faker.seed(id)

    // Public IPs so the geo map resolves to a real location
    const publicIps = ['49.36.112.45', '103.21.244.10', '8.8.8.8', '81.2.69.142', '185.199.108.153', '1.1.1.1', '14.139.56.20', '52.95.110.1']
    const scenarios = [
      {
        module: 'FINANCE', entity: 'WITHDRAWAL', action: 'APPROVE', endpoint: '/admin/withdrawals/approve', method: 'POST',
        changes: { status: { old: 'pending', new: 'approved' }, approved_amount: { old: 0, new: 1250.5 }, remarks: { old: null, new: 'Verified bank details' } },
        business_context: { payment_id: `PAY-${id}`, gateway: 'Bank Transfer', amount: 1250.5, currency: 'USD', txid: `TX${id}9A7F` }
      },
      {
        module: 'LEAD_MANAGEMENT', entity: 'CLIENT', action: 'UPDATE', endpoint: '/admin/clients/update', method: 'PATCH',
        changes: { email: { old: 'old.mail@example.com', new: faker.internet.email() }, phone: { old: '+91 98000 11111', new: '+91 98765 43210' }, country: { old: 'IN', new: 'AE' } },
        business_context: { lead_code: `LD-${id}`, country: 'AE', kyc_status: 'verified' }
      },
      {
        module: 'TRADING', entity: 'ACCOUNT', action: 'UPDATE', endpoint: '/admin/trading-accounts/leverage', method: 'PUT',
        changes: { leverage: { old: '1:100', new: '1:500' }, group: { old: 'real\\standard', new: 'real\\pro' } },
        business_context: { account_number: String(500000 + (id % 9999)), platform: 'MT5', server: 'Live-01' }
      },
      {
        module: 'RBAC', entity: 'ROLE', action: 'UPDATE', endpoint: '/admin/rbac/roles', method: 'PATCH',
        changes: { permissions_count: { old: 12, new: 18 }, can_approve_withdrawals: { old: false, new: true } },
        business_context: { role_id: id % 50, name: 'Finance Manager' }
      }
    ]
    const sc = scenarios[id % scenarios.length]
    const actorName = faker.person.fullName()
    const destName = faker.person.fullName()
    const ip = publicIps[id % publicIps.length]

    return HttpResponse.json({
      status: 'success',
      data: {
        id,
        audit_log_id: id,
        module: sc.module,
        entity_type: sc.entity,
        entity_id: faker.number.int({ min: 1000, max: 50000 }),
        action: sc.action,
        status: 'SUCCESS',
        summary: `${actorName} ${sc.action.toLowerCase()}d ${sc.entity.toLowerCase()} for ${destName}.`,
        changes: sc.changes,
        actor: {
          id: faker.number.int({ min: 1, max: 200 }),
          type: 'STAFF',
          name: actorName,
          email: faker.internet.email({ firstName: actorName.split(' ')[0] }).toLowerCase(),
          role: faker.helpers.arrayElement(['super_admin', 'finance_manager', 'support_agent'])
        },
        destination: {
          user_id: faker.number.int({ min: 1000, max: 9999 }),
          name: destName,
          email: faker.internet.email({ firstName: destName.split(' ')[0] }).toLowerCase(),
          role: 'client',
          account_number: String(500000 + (id % 9999))
        },
        business_context: sc.business_context,
        request_context: {
          ip_address: ip,
          http_method: sc.method,
          endpoint: sc.endpoint,
          request_id: faker.string.uuid(),
          user_agent: faker.helpers.arrayElement([
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
          ])
        },
        created_at: faker.date.recent({ days: 10 }).toISOString()
      }
    })
  }),

  http.get('/api' + urls.enhancedAuditLogs.filters, () => {
    return HttpResponse.json({
      status: 'success',
      step: 'modules',
      modules: ['CRM', 'WALLET', 'TRADING', 'USERS']
    })
  }),

  // ---------------------------------------------------------
  // TICKETS & PLATFORM TICKETS
  // ---------------------------------------------------------
  http.get('/api' + urls.tickets.list, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const perPage = parseInt(url.searchParams.get('per_page')) || 10
    
    const totalItems = 20
    const allTickets = Array.from({ length: totalItems }).map((_, i) => ({
      id: faker.number.int({ min: 1000, max: 9999 }),
      ticket_number: `TKT-${faker.number.int({ min: 1000, max: 9999 })}`,
      subject: faker.lorem.words(4),
      status: faker.helpers.arrayElement(['open', 'in_progress', 'resolved', 'closed']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
      category: faker.helpers.arrayElement(['General', 'Technical', 'Billing']),
      client_name: faker.person.fullName(),
      assigned_to: faker.person.fullName(),
      created_at: faker.date.recent().toISOString(),
      updated_at: faker.date.recent().toISOString()
    }))

    return HttpResponse.json({
      status: 'success',
      data: paginate(allTickets, page, perPage),
      pagination: { page, per_page: perPage, total_items: totalItems, total_pages: Math.ceil(totalItems/perPage) }
    })
  }),

  http.get('/api' + urls.platformTickets.list, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const perPage = parseInt(url.searchParams.get('per_page')) || 10
    
    const totalItems = 20
    const allTickets = Array.from({ length: totalItems }).map((_, i) => ({
      id: faker.number.int({ min: 1000, max: 9999 }),
      ticket_number: `PT-${faker.number.int({ min: 1000, max: 9999 })}`,
      subject: faker.lorem.words(4),
      status: faker.helpers.arrayElement(['open', 'in_progress', 'resolved', 'closed']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
      category: faker.helpers.arrayElement(['General', 'Technical', 'Billing']),
      client_name: faker.person.fullName(),
      assigned_to: faker.person.fullName(),
      created_at: faker.date.recent().toISOString(),
      updated_at: faker.date.recent().toISOString()
    }))

    return HttpResponse.json({
      status: 'success',
      data: paginate(allTickets, page, perPage),
      pagination: { page, per_page: perPage, total_items: totalItems, total_pages: Math.ceil(totalItems/perPage) }
    })
  }),

  // ---------------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------------
  http.get('/api/notifications/list', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const perPage = parseInt(url.searchParams.get('per_page')) || 10
    
    const totalItems = 30
    const allNotifs = Array.from({ length: totalItems }).map((_, i) => ({
      id: faker.number.int({ min: 100, max: 999 }),
      title: faker.lorem.words(3),
      message: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['system', 'alert', 'marketing']),
      status: faker.helpers.arrayElement(['sent', 'scheduled', 'draft']),
      scheduled_at: faker.date.recent().toISOString(),
      created_at: faker.date.recent().toISOString()
    }))

    return HttpResponse.json({
      status: 'success',
      data: paginate(allNotifs, page, perPage),
      pagination: { page, per_page: perPage, total_items: totalItems, total_pages: Math.ceil(totalItems/perPage) }
    })
  }),

  http.get('/api/admin/notification/user-depth', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        total_users: 15200,
        active_users: 12000,
        unsubscribed: 3200
      }
    })
  }),

  // ---------------------------------------------------------
  // LOYALTY PROGRAM
  // ---------------------------------------------------------
  http.get('/api' + urls.loyalty.deals, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const perPage = parseInt(url.searchParams.get('per_page')) || 10
    
    const totalItems = 40
    const allDeals = Array.from({ length: totalItems }).map((_, i) => ({
      id: faker.string.uuid(),
      mt5_deal_id: faker.number.int({ min: 1000000, max: 9999999 }),
      account_number: faker.number.int({ min: 1000, max: 9999 }),
      position_id: faker.number.int({ min: 100000, max: 999999 }),
      symbol: faker.helpers.arrayElement(['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD']),
      side: faker.helpers.arrayElement(['BUY', 'SELL']),
      lots: faker.finance.amount({ min: 0.01, max: 10, dec: 2 }),
      duration_seconds: faker.number.int({ min: 10, max: 3600 }),
      points_awarded: faker.finance.amount({ min: 0.1, max: 50, dec: 2 }),
      eligibility_status: faker.helpers.arrayElement(['awarded', 'not_awarded', 'pending']),
      close_time: faker.date.recent().toISOString()
    }))

    return HttpResponse.json({
      status: 'success',
      data: paginate(allDeals, page, perPage),
      pagination: { page, per_page: perPage, total_items: totalItems, total_pages: Math.ceil(totalItems/perPage) }
    })
  }),

  // Note: catching all /loyalty/* as a fallback just in case
  http.get('/api/loyalty/*', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const perPage = parseInt(url.searchParams.get('per_page')) || 10
    
    const totalItems = 15
    const genericLoyaltyData = Array.from({ length: totalItems }).map((_, i) => ({
      id: faker.number.int({ min: 10, max: 999 }),
      program_name: faker.company.name() + ' Rewards',
      name: faker.commerce.productName(),
      points: faker.number.int({ min: 100, max: 5000 }),
      tier_name: faker.helpers.arrayElement(['Bronze', 'Silver', 'Gold', 'Platinum']),
      is_active: faker.datatype.boolean(),
      status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
      created_at: faker.date.recent().toISOString()
    }))

    return HttpResponse.json({
      status: 'success',
      data: paginate(genericLoyaltyData, page, perPage),
      pagination: { page, per_page: perPage, total_items: totalItems, total_pages: Math.ceil(totalItems/perPage) }
    })
  })
]
