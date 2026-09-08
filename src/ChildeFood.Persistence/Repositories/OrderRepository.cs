using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Persistence.Repositories;

// ریپازیتوری سفارشات مدارس؛ شامل جوین با فرزند، مدرسه، و آیتم‌های ریز سفارش با قیمت‌های ثبت شده.
public class OrderRepository : GenericRepository<SchoolOrder>, IOrderRepository
{
    public OrderRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<SchoolOrder?> GetOrderByCodeAsync(string orderCode, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(o => o.Child)
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderCode == orderCode, cancellationToken);
    }

    public async Task<IReadOnlyList<SchoolOrder>> GetOrdersByParentIdAsync(Guid parentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(o => o.Child)
            .Include(o => o.OrderItems)
            .Where(o => o.ParentId == parentId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SchoolOrder>> GetOrdersByChildIdAsync(Guid childId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .Where(o => o.ChildId == childId)
            .OrderByDescending(o => o.ServingDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<SchoolOrder?> GetOrderWithItemsAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(o => o.Child)
                .ThenInclude(c => c!.School)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.FoodItem)
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
    }

    public async Task<IReadOnlyList<SchoolOrder>> GetOrdersByDateAndStatusAsync(DateOnly servingDate, OrderStatus? status, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(o => o.Child)
            .Include(o => o.OrderItems)
            .Where(o => o.ServingDate == servingDate);

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        return await query
            .OrderBy(o => o.DeliveryTime)
            .ToListAsync(cancellationToken);
    }
}
