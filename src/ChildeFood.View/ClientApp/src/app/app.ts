import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

// روت اصلی اپلیکیشن چایلدفود؛
// اینجا کار رو ساده و تمیز نگه داشتیم تا فقط روتینگ رو مدیریت کنه و کنترل پنل ادمین و کاربر کاملاً دکوپله باشن
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {}
