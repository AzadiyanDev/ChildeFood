using ChildeFood.Application.Interfaces;
using ChildeFood.Persistence.Data;
using ChildeFood.Persistence.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace ChildeFood.Persistence.UnitOfWork;

// پیاده‌سازی واحد کار؛ مدیریت ریپازیتوری‌ها، تراکنش‌ها (Transactions) و ذخیره یکپارچه دیتا.
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    private IChildRepository? _childRepository;
    private IFoodRepository? _foodRepository;
    private IOrderRepository? _orderRepository;
    private IWalletRepository? _walletRepository;
    private ICouponRepository? _couponRepository;
    private IOtpRepository? _otpRepository;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IChildRepository Children => _childRepository ??= new ChildRepository(_context);
    public IFoodRepository Foods => _foodRepository ??= new FoodRepository(_context);
    public IOrderRepository Orders => _orderRepository ??= new OrderRepository(_context);
    public IWalletRepository Wallets => _walletRepository ??= new WalletRepository(_context);
    public ICouponRepository Coupons => _couponRepository ??= new CouponRepository(_context);
    public IOtpRepository OtpCodes => _otpRepository ??= new OtpRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is not null)
            return;

        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);

            if (_transaction is not null)
            {
                await _transaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            await RollbackAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_transaction is not null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    public async Task RollbackAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is not null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

    public async ValueTask DisposeAsync()
    {
        if (_transaction is not null)
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }

        await _context.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}
