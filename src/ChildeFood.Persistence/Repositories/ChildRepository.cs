using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Persistence.Repositories;

// ریپازیتوری اختصاصی فرزندان دانش‌آموز؛ کوئری‌های جوین با مدرسه و واکشی بچه‌های یک والد.
public class ChildRepository : GenericRepository<Child>, IChildRepository
{
    public ChildRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Child>> GetChildrenByParentIdAsync(Guid parentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(c => c.School)
            .Where(c => c.ParentId == parentId && c.IsActive)
            .OrderBy(c => c.FullName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Child>> GetChildrenBySchoolIdAsync(Guid schoolId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(c => c.SchoolId == schoolId && c.IsActive)
            .OrderBy(c => c.Grade)
            .ThenBy(c => c.FullName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Child?> GetChildWithSchoolAsync(Guid childId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(c => c.School)
            .FirstOrDefaultAsync(c => c.Id == childId, cancellationToken);
    }
}
