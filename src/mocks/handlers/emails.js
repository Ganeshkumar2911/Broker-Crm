import { http, HttpResponse } from 'msw'
import urls from '../../api/urls'
import { faker } from '@faker-js/faker'

function paginate(items, page, perPage) {
  const start = (page - 1) * perPage
  const end = start + perPage
  return items.slice(start, end)
}

export const emailsHandlers = [
  // EMAIL SETTINGS
  http.get('/api' + urls.emailSettings.details, () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        provider: 'brevo',
        api_key: faker.string.alphanumeric(32),
        from_name: 'Panther Capital Admin',
        from_email: 'admin@panthercapital.com',
        reply_to_email: 'support@panthercapital.com',
        is_active: true
      }
    })
  }),

  http.put('/api' + urls.emailSettings.update, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      status: 'success',
      message: 'Email settings updated successfully',
      data: body
    })
  }),

  // EMAIL TEMPLATES
  http.get('/api' + urls.emailTemplates.list, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const perPage = parseInt(url.searchParams.get('per_page')) || 10
    
    const totalItems = 15
    const totalPages = Math.ceil(totalItems / perPage)

    const allTemplates = Array.from({ length: totalItems }).map((_, i) => ({
      id: faker.number.int({ min: 100, max: 999 }),
      template_name: faker.helpers.arrayElement(['Welcome Email', 'Password Reset', 'Deposit Confirmation', 'Withdrawal Request']),
      template_code: faker.string.alphanumeric(8).toUpperCase(),
      subject: faker.lorem.sentence(),
      content: '<p>This is a mock email template.</p>',
      is_active: faker.datatype.boolean(),
      created_at: faker.date.recent().toISOString(),
      updated_at: faker.date.recent().toISOString()
    }))

    return HttpResponse.json({
      status: 'success',
      data: paginate(allTemplates, page, perPage),
      pagination: { page, per_page: perPage, total_items: totalItems, total_pages: totalPages }
    })
  }),

  // EMAIL LOGS (New Email Logs)
  http.get('/api' + urls.emailLogs.logList, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const perPage = parseInt(url.searchParams.get('per_page')) || 10
    
    const totalItems = 45
    const totalPages = Math.ceil(totalItems / perPage)

    const allLogs = Array.from({ length: totalItems }).map((_, i) => ({
      id: faker.number.int({ min: 1000, max: 9999 }),
      tag: faker.string.alphanumeric(8).toUpperCase(),
      template_code: faker.string.alphanumeric(8).toUpperCase(),
      total_dispatched: faker.number.int({ min: 10, max: 5000 }),
      delivered_count: faker.number.int({ min: 0, max: 5000 }),
      bounce_count: faker.number.int({ min: 0, max: 50 }),
      open_count: faker.number.int({ min: 0, max: 1000 }),
      click_count: faker.number.int({ min: 0, max: 500 }),
      status: faker.helpers.arrayElement(['completed', 'processing', 'failed']),
      created_at: faker.date.recent().toISOString()
    }))

    return HttpResponse.json({
      status: 'success',
      tags: paginate(allLogs, page, perPage),
      pagination: { page, per_page: perPage, total_items: totalItems, total_pages: totalPages }
    })
  }),

  // BREVO LOGS
  http.get('/api' + urls.emailLogs.list, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const perPage = parseInt(url.searchParams.get('per_page')) || 10
    
    const totalItems = 50
    const totalPages = Math.ceil(totalItems / perPage)

    const allBrevoLogs = Array.from({ length: totalItems }).map((_, i) => ({
      id: faker.string.uuid(),
      messageId: faker.string.uuid(),
      email: faker.internet.email(),
      subject: faker.lorem.sentence(),
      event: faker.helpers.arrayElement(['delivered', 'bounced', 'opened', 'clicked', 'request']),
      date: faker.date.recent().toISOString(),
      from: 'admin@panthercapital.com',
      tag: faker.string.alphanumeric(8).toUpperCase()
    }))

    return HttpResponse.json({
      status: 'success',
      results: paginate(allBrevoLogs, page, perPage),
      page: page,
      per_page: perPage,
      hasNext: page < totalPages,
      hasPrev: page > 1
    })
  }),

  // EMAIL TAGS (Filters)
  http.get('/api' + urls.emailLogs.tags, () => {
    return HttpResponse.json({
      status: 'success',
      tags: Array.from({ length: 5 }).map(() => ({
        tag: faker.string.alphanumeric(8).toUpperCase(),
        template_name: faker.lorem.words(2)
      }))
    })
  }),

  // EMAIL TEMPLATE DETAILS
  http.get('/api' + urls.emailTemplates.details + '/:id', ({ params }) => {
    return HttpResponse.json({
      status: 'success',
      data: {
        id: params.id,
        template_name: faker.helpers.arrayElement(['Welcome Email', 'Password Reset', 'Deposit Confirmation']),
        template_code: faker.string.alphanumeric(8).toUpperCase(),
        subject: faker.lorem.sentence(),
        content: '<p>This is a detailed mock email template content.</p><br/><ul><li>Variable 1</li><li>Variable 2</li></ul>',
        is_active: faker.datatype.boolean(),
        created_at: faker.date.recent().toISOString(),
        updated_at: faker.date.recent().toISOString()
      }
    })
  }),

  // DISPATCH RECORDS (Campaign Details)
  http.get('/api' + urls.emailLogs.logDetails, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const perPage = parseInt(url.searchParams.get('per_page')) || 10
    const campaignId = url.searchParams.get('campaign_id') || faker.number.int({ min: 1000, max: 9999 })
    
    const totalItems = 35
    const totalPages = Math.ceil(totalItems / perPage)

    const records = Array.from({ length: totalItems }).map((_, i) => ({
      created_at: faker.date.recent().toISOString(),
      email: faker.internet.email(),
      subject: faker.lorem.sentence(),
      latest_event: faker.helpers.arrayElement(['delivered', 'opened', 'clicked', 'bounced']),
      sync_status: faker.helpers.arrayElement(['synced', 'pending', 'failed']),
      message_id: faker.string.uuid()
    }))

    return HttpResponse.json({
      status: 'success',
      data: {
        tag: 'Mock Campaign Tag',
        campaign_id: campaignId,
        body_html: '<div style="padding: 20px; font-family: sans-serif;"><h1>Hello User</h1><p>This is a mock email campaign template preview.</p></div>',
        records: paginate(records, page, perPage),
        pagination: { page, per_page: perPage, total_items: totalItems, total_pages: totalPages }
      }
    })
  }),

  // VIEW LOG DETAILS (Message Timeline Preview)
  http.get('/api' + urls.emailLogs.viewLogDetails, ({ request }) => {
    const url = new URL(request.url)
    const messageId = url.searchParams.get('messageId') || faker.string.uuid()

    return HttpResponse.json({
      status: 'success',
      subject: faker.lorem.sentence(),
      email: faker.internet.email(),
      messageId: messageId,
      from: 'admin@panthercapital.com',
      date: faker.date.recent().toISOString(),
      body: '<div style="padding: 20px; font-family: sans-serif;"><h2>Your Account Alert</h2><p>Here is your mock sandbox email content.</p></div>',
      events: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }).map(() => ({
        name: faker.helpers.arrayElement(['request', 'delivered', 'opened', 'clicked']),
        time: faker.date.recent().toISOString(),
        ip: faker.internet.ip()
      }))
    })
  })
]
