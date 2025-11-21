// Middleware para autenticação do Master Panel
export const authenticateMasterPanel = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];
  
  // Verificar se é uma requisição do Master Panel
  if (apiKey === 'master-panel-api-key-2024') {
    // Permitir acesso completo para o Master Panel
    req.isMasterPanel = true;
    req.masterPanelAccess = true;
    return next();
  }
  
  // Verificar token JWT normal
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de acesso necessário'
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    req.isMasterPanel = false;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

// Endpoint para estatísticas do sistema
export const getSystemStats = async (req: any, res: any) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalVessels,
      activeVessels,
      totalBookings,
      confirmedBookings,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.vessel.count(),
      prisma.vessel.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: 'CONFIRMED' }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalVessels,
        activeVessels,
        totalBookings,
        confirmedBookings,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Endpoint para obter usuários
export const getUsersForMaster = async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          phone: true,
          createdAt: true,
          lastLoginAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Endpoint para obter embarcações
export const getVesselsForMaster = async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.isActive = status === 'active';
    }

    const [vessels, total] = await Promise.all([
      prisma.vessel.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          capacity: true,
          pricePerHour: true,
          isActive: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.vessel.count({ where })
    ]);

    res.json({
      success: true,
      data: vessels,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao obter embarcações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Endpoint para obter reservas
export const getBookingsForMaster = async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (dateFrom) {
      where.startDate = { gte: new Date(dateFrom) };
    }
    
    if (dateTo) {
      where.startDate = { ...where.startDate, lte: new Date(dateTo) };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          vessel: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { startDate: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao obter reservas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Endpoint para obter logs de auditoria
export const getAuditLogsForMaster = async (req: any, res: any) => {
  try {
    const { page = 1, limit = 50, action, userId, dateFrom, dateTo } = req.query;
    
    const where: any = {};
    
    if (action) {
      where.action = action;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (dateFrom) {
      where.createdAt = { gte: new Date(dateFrom) };
    }
    
    if (dateTo) {
      where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      success: true,
      data: auditLogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao obter logs de auditoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};





