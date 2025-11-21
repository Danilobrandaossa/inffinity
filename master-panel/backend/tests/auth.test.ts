import request from 'supertest'
import { app } from '../src/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Master Auth API', () => {
  beforeEach(async () => {
    // Limpar dados de teste
    await prisma.masterSession.deleteMany()
    await prisma.masterUser.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Criar usuário master de teste
      const testUser = await prisma.masterUser.create({
        data: {
          email: 'test@reservapro.com',
          name: 'Test User',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKzKz', // 'password123'
          role: 'MASTER_SUPPORT',
          isActive: true
        }
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@reservapro.com',
          password: 'password123'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.user.email).toBe('test@reservapro.com')
    })

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@reservapro.com',
          password: 'wrongpassword'
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('should require 2FA when enabled', async () => {
      const testUser = await prisma.masterUser.create({
        data: {
          email: 'test2fa@reservapro.com',
          name: 'Test 2FA User',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKzKz',
          role: 'MASTER_SUPPORT',
          isActive: true,
          twoFactorEnabled: true,
          twoFactorSecret: 'JBSWY3DPEHPK3PXP'
        }
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test2fa@reservapro.com',
          password: 'password123'
        })

      expect(response.status).toBe(200)
      expect(response.body.data.requiresTwoFactor).toBe(true)
    })
  })

  describe('GET /api/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const testUser = await prisma.masterUser.create({
        data: {
          email: 'profile@reservapro.com',
          name: 'Profile User',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKzKz',
          role: 'MASTER_OWNER',
          isActive: true
        }
      })

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profile@reservapro.com',
          password: 'password123'
        })

      const token = loginResponse.body.data.accessToken

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.email).toBe('profile@reservapro.com')
      expect(response.body.data.role).toBe('MASTER_OWNER')
    })

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const testUser = await prisma.masterUser.create({
        data: {
          email: 'logout@reservapro.com',
          name: 'Logout User',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKzKz',
          role: 'MASTER_SUPPORT',
          isActive: true
        }
      })

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logout@reservapro.com',
          password: 'password123'
        })

      const token = loginResponse.body.data.accessToken

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })
})








