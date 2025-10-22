import { prisma } from '../utils/prisma';

export class AnalyticsService {
  // Estatísticas gerais do sistema
  async getGeneralStats() {
    const [
      totalUsers,
      totalVessels,
      totalBookings,
      activeBookings,
      totalRevenue,
      pendingPayments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vessel.count(),
      prisma.booking.count(),
      prisma.booking.count({
        where: { status: { in: ['PENDING', 'APPROVED'] } }
      }),
      prisma.installment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true }
      }),
      prisma.installment.count({
        where: { status: 'PENDING' }
      })
    ]);

    return {
      totalUsers,
      totalVessels,
      totalBookings,
      activeBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingPayments
    };
  }

  // Reservas por mês (últimos 12 meses)
  async getBookingsByMonth() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const bookings = await prisma.booking.groupBy({
      by: ['bookingDate'],
      where: {
        bookingDate: { gte: twelveMonthsAgo }
      },
      _count: { id: true }
    });

    // Agrupar por mês
    const monthlyData = new Map();
    
    bookings.forEach(booking => {
      const month = booking.bookingDate.toISOString().substring(0, 7); // YYYY-MM
      monthlyData.set(month, (monthlyData.get(month) || 0) + booking._count.id);
    });

    // Preencher meses sem dados
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toISOString().substring(0, 7);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      result.push({
        month: monthName,
        bookings: monthlyData.get(month) || 0
      });
    }

    return result;
  }

  // Reservas por embarcação
  async getBookingsByVessel() {
    const bookings = await prisma.booking.groupBy({
      by: ['vesselId'],
      _count: { id: true },
      where: {
        bookingDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Últimos 30 dias
      }
    });

    const vesselData = await Promise.all(
      bookings.map(async (booking) => {
        const vessel = await prisma.vessel.findUnique({
          where: { id: booking.vesselId }
        });
        return {
          vesselName: vessel?.name || 'Embarcação não encontrada',
          bookings: booking._count.id
        };
      })
    );

    return vesselData.sort((a, b) => b.bookings - a.bookings);
  }

  // Status de pagamentos
  async getPaymentStatus() {
    const [
      paidInstallments,
      pendingInstallments,
      overdueInstallments,
      paidMarinaPayments,
      pendingMarinaPayments,
      overdueMarinaPayments
    ] = await Promise.all([
      prisma.installment.count({ where: { status: 'PAID' } }),
      prisma.installment.count({ where: { status: 'PENDING' } }),
      prisma.installment.count({ where: { status: 'OVERDUE' } }),
      prisma.marinaPayment.count({ where: { status: 'PAID' } }),
      prisma.marinaPayment.count({ where: { status: 'PENDING' } }),
      prisma.marinaPayment.count({ where: { status: 'OVERDUE' } })
    ]);

    return {
      installments: {
        paid: paidInstallments,
        pending: pendingInstallments,
        overdue: overdueInstallments
      },
      marinaPayments: {
        paid: paidMarinaPayments,
        pending: pendingMarinaPayments,
        overdue: overdueMarinaPayments
      }
    };
  }

  // Receita por mês
  async getRevenueByMonth() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const installments = await prisma.installment.findMany({
      where: {
        status: 'PAID',
        paymentDate: { gte: twelveMonthsAgo }
      },
      select: {
        amount: true,
        paymentDate: true
      }
    });

    const marinaPayments = await prisma.marinaPayment.findMany({
      where: {
        status: 'PAID',
        paymentDate: { gte: twelveMonthsAgo }
      },
      select: {
        amount: true,
        paymentDate: true
      }
    });

    // Agrupar por mês
    const monthlyRevenue = new Map();

    [...installments, ...marinaPayments].forEach(payment => {
      if (payment.paymentDate) {
        const month = payment.paymentDate.toISOString().substring(0, 7);
        monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + payment.amount);
      }
    });

    // Preencher meses sem dados
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toISOString().substring(0, 7);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      result.push({
        month: monthName,
        revenue: monthlyRevenue.get(month) || 0
      });
    }

    return result;
  }

  // Usuários por status
  async getUsersByStatus() {
    const users = await prisma.user.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    return users.map(user => ({
      status: user.status,
      count: user._count.id
    }));
  }

  // Atividade recente
  async getRecentActivity(limit = 10) {
    const activities = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      entityType: activity.entityType,
      user: activity.user?.name || 'Sistema',
      createdAt: activity.createdAt,
      details: activity.details
    }));
  }

  // Estatísticas de uso das embarcações
  async getVesselUsageStats() {
    const vessels = await prisma.vessel.findMany({
      include: {
        bookings: {
          where: {
            bookingDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        userVessels: {
          include: {
            user: true
          }
        }
      } as any
    });

    return vessels.map(vessel => ({
      id: vessel.id,
      name: vessel.name,
      totalBookings: vessel.bookings?.length || 0,
      linkedUsers: vessel.userVessels?.length || 0,
      utilizationRate: (vessel.bookings?.length || 0) / 30 * 100 // % de utilização nos últimos 30 dias
    }));
  }

  // Dashboard completo
  async getDashboardData() {
    const [
      generalStats,
      bookingsByMonth,
      bookingsByVessel,
      paymentStatus,
      revenueByMonth,
      usersByStatus,
      recentActivity,
      vesselUsageStats
    ] = await Promise.all([
      this.getGeneralStats(),
      this.getBookingsByMonth(),
      this.getBookingsByVessel(),
      this.getPaymentStatus(),
      this.getRevenueByMonth(),
      this.getUsersByStatus(),
      this.getRecentActivity(),
      this.getVesselUsageStats()
    ]);

    return {
      generalStats,
      bookingsByMonth,
      bookingsByVessel,
      paymentStatus,
      revenueByMonth,
      usersByStatus,
      recentActivity,
      vesselUsageStats
    };
  }
}

