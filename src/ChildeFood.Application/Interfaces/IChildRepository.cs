using ChildeFood.Domain.Entities;

namespace ChildeFood.Application.Interfaces;

// اینترفیس اختصاصی فرزندان؛ متدهای ویژه واکشی بچه‌های یک والد خاص یا لیست دانش‌آموزان یک مدرسه.
public interface IChildRepository : IGenericRepository<Child>
{
    // دریافت لیست فرزندان فعال یک والد خاص
    Task<IReadOnlyList<Child>> GetChildrenByParentIdAsync(Guid parentId, CancellationToken cancellationToken = default);

    // دریافت لیست دانش‌آموزان متعلق به یک مدرسه
    Task<IReadOnlyList<Child>> GetChildrenBySchoolIdAsync(Guid schoolId, CancellationToken cancellationToken = default);

    // دریافت اطلاعات کامل فرزند به همراه جزئیات مدرسه
    Task<Child?> GetChildWithSchoolAsync(Guid childId, CancellationToken cancellationToken = default);
}
