import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

// In-memory food items migrated from .NET FoodsController
interface FoodEntity {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  category: string;
  badge?: string;
  emoji?: string;
}

const mockFoods: FoodEntity[] = [
  { id: 1, title: 'برگر دوبل اسمش', subtitle: 'دو لایه گوشت با پنیر دوبل', price: 75000, category: 'main', badge: 'محبوب 🔥', emoji: '🍔' },
  { id: 2, title: 'چلو جوجه کباب زعفرانی', subtitle: 'همراه با برنج درجه یک ایرانی', price: 89000, category: 'main', badge: 'غذای روز', emoji: '🍗' },
  { id: 3, title: 'پیتزا سیسیلیا', subtitle: 'پیتزا مخصوص ایتالیایی با پنیر کش‌دار', price: 85000, category: 'main', badge: '۲۵٪-', emoji: '🍕' },
  { id: 4, title: 'پاستا آلفردو', subtitle: 'با فیله مرغ و قارچ تازه و خامه', price: 92000, category: 'main', badge: '۱۵٪-', emoji: '🍝' },
  { id: 5, title: 'آبمیوه طبیعی پرتقال', subtitle: 'آب پرتقال تازه و ارگانیک', price: 25000, category: 'drinks', badge: 'طبیعی', emoji: '🧃' },
  { id: 6, title: 'دونات شکلاتی مخصوص', subtitle: 'دونات نرم با روکش شکلات بلژیکی', price: 32000, category: 'dessert', badge: 'محبوب 🔥', emoji: '🍩' },
];

app.get(['/api/foods', '/api/Foods'], (_req, res) => {
  res.json(mockFoods);
});

app.get(['/api/foods/:id', '/api/Foods/:id'], (req, res) => {
  const paramId = req.params['id'];
  const rawId = Array.isArray(paramId) ? paramId[0] : paramId;
  const id = rawId ? parseInt(rawId, 10) : NaN;
  const food = mockFoods.find((f) => f.id === id);
  if (!food) {
    return res.status(404).json({ message: `غذایی با شناسه ${id} پیدا نشد.` });
  }
  return res.json(food);
});

app.post(['/api/foods', '/api/Foods'], (req, res) => {
  const body = req.body as Record<string, unknown> | undefined;
  const newFood: FoodEntity = {
    id: mockFoods.length > 0 ? Math.max(...mockFoods.map((f) => f.id)) + 1 : 1,
    title: typeof body?.['title'] === 'string' ? body['title'] : 'غذای جدید',
    subtitle: typeof body?.['subtitle'] === 'string' ? body['subtitle'] : '',
    price: typeof body?.['price'] === 'number' ? body['price'] : Number(body?.['price']) || 50000,
    category: typeof body?.['category'] === 'string' ? body['category'] : 'main',
    badge: typeof body?.['badge'] === 'string' ? body['badge'] : undefined,
    emoji: typeof body?.['emoji'] === 'string' ? body['emoji'] : '🍲',
  };
  mockFoods.push(newFood);
  res.status(201).json(newFood);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = Number(process.env['PORT']) || 3000;
  app.listen(port, '0.0.0.0', (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://0.0.0.0:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
