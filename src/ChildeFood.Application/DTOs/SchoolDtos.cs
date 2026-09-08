namespace ChildeFood.Application.DTOs;

// اطلاعات مدرسه جهت ارسال به فرانت‌اند و نمایش در سلکت‌باکس ثبت‌نام فرزند
public class SchoolDto
{
    // شناسه یکتای مدرسه در پایگاه داده
    public Guid Id { get; set; }

    // نام مدرسه یا مجتمع آموزشی (مثلاً: دبستان دخترانه فرزانگان)
    public string Name { get; set; } = string.Empty;

    // کد شعبه یا کد منطقه
    public string BranchCode { get; set; } = string.Empty;

    // آدرس پستی یا محله مدرسه
    public string Address { get; set; } = string.Empty;

    // ساعت پیش‌فرض توزیع ناهار گرم
    public string DefaultLunchTime { get; set; } = "12:30";

    // وضعیت فعالیت مدرسه
    public bool IsActive { get; set; } = true;
}

// مدل ایجاد مدرسه جدید توسط ادمین سیستم
public class CreateSchoolDto
{
    // نام مدرسه یا مجتمع آموزشی
    public string Name { get; set; } = string.Empty;

    // کد شعبه یا کد واحد آموزشی (اختیاری)
    public string? BranchCode { get; set; }

    // آدرس مدرسه
    public string? Address { get; set; }

    // ساعت توزیع ناهار بوفه
    public string? DefaultLunchTime { get; set; }

    // مسئول هماهنگی یا رابط تغذیه
    public string? ContactPerson { get; set; }
}
