import request from 'supertest'
import { app } from '../src/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Master Tenants API', () => {
  let masterUser: any
  let authToken: string

  beforeEach(async () => {
    // Limpar dados de teste
    await prisma.masterSession.deleteMany()
    await prisma.masterUser.deleteMany()
    await prisma.tenant.deleteMany()

    // Criar usuário master de teste
    masterUser = await prisma.masterUser.create({
      data: {
        email: 'master@test.com',
        name: 'Master User',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKzKz',
        role: 'MASTER_OWNER',
        isActive: true
      }
    })

    // Fazer login para obter token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'master@test.com',
        password: 'password123'
      })

    authToken = loginResponse.body.data.accessToken
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('GET /api/tenants', () => {
    it('should return list of tenants', async () => {
      // Criar tenant de teste
      await prisma.tenant.create({
        data: {
          name: 'Test Company',
          slug: 'test-company',
          email: 'test@company.com',
          status: 'ACTIVE',
          schemaName: 'tenant_test_company'
        }
      })

      const response = await request(app)
        .get('/api/tenants')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].name).toBe('Test Company')
    })

    it('should filter tenants by status', async () => {
      // Criar tenants com diferentes status
      await prisma.tenant.createMany({
        data: [
          {
            name: 'Active Company',
            slug: 'active-company',
            email: 'active@company.com',
            status: 'ACTIVE',
            schemaName: 'tenant_active_company'
          },
          {
            name: 'Suspended Company',
            slug: 'suspended-company',
            email: 'suspended@company.com',
            status: 'SUSPENDED',
            schemaName: 'tenant_suspended_company'
          }
        ]
      })

      const response = await request(app)
        .get('/api/tenants?status=ACTIVE')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].status).toBe('ACTIVE')
    })
  })

  describe('POST /api/tenants', () => {
    it('should create new tenant', async () => {
      const tenantData = {
        name: 'New Company',
        slug: 'new-company',
        email: 'new@company.com',
        phone: '+55 11 99999-9999',
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'BR'
      }

      const response = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tenantData)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('New Company')
      expect(response.body.data.status).toBe('TRIAL')
    })

    it('should fail with duplicate slug', async () => {
      // Criar tenant inicial
      await prisma.tenant.create({
        data: {
          name: 'Existing Company',
          slug: 'existing-company',
          email: 'existing@company.com',
          schemaName: 'tenant_existing_company'
        }
      })

      const response = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Another Company',
          slug: 'existing-company', // Slug duplicado
          email: 'another@company.com'
        })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/tenants/:id/suspend', () => {
    it('should suspend tenant', async () => {
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Company to Suspend',
          slug: 'company-to-suspend',
          email: 'suspend@company.com',
          status: 'ACTIVE',
          schemaName: 'tenant_suspend_company'
        }
      })

      const response = await request(app)
        .post(`/api/tenants/${tenant.id}/suspend`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Violation of terms'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBe('SUSPENDED')
    })
  })

  describe('POST /api/tenants/:id/activate', () => {
    it('should activate suspended tenant', async () => {
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Suspended Company',
          slug: 'suspended-company',
          email: 'suspended@company.com',
          status: 'SUSPENDED',
          schemaName: 'tenant_suspended_company'
        }
      })

      const response = await request(app)
        .post(`/api/tenants/${tenant.id}/activate`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBe('ACTIVE')
    })
  })
})








