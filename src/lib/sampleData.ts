import { v4 as uuid } from 'uuid';
import { format, subDays, addMonths } from 'date-fns';
import type { Transaction, Budget, SavingsGoal } from '../types';
import { defaultCategories } from './categories';

const expenseCategories = defaultCategories.filter(c => c.type === 'expense');
const incomeCategories = defaultCategories.filter(c => c.type === 'income');

const merchants: Record<string, string[]> = {
  'cat-groceries': ['Whole Foods', 'Trader Joes', 'Costco', 'Safeway'],
  'cat-dining': ['Chipotle', 'Starbucks', 'Olive Garden', 'Subway'],
  'cat-transport': ['Shell', 'Uber', 'Lyft', 'BP Gas'],
  'cat-entertainment': ['Netflix', 'Spotify', 'AMC Theaters', 'Steam'],
  'cat-shopping': ['Amazon', 'Target', 'Nike', 'Best Buy'],
  'cat-health': ['CVS Pharmacy', 'Planet Fitness', 'Walgreens'],
  'cat-utilities': ['Electric Co', 'Water Dept', 'AT&T', 'Comcast'],
  'cat-housing': ['Rent Payment', 'Home Depot', 'IKEA'],
  'cat-education': ['Udemy', 'Coursera', 'Barnes & Noble'],
  'cat-subscriptions': ['Netflix', 'Spotify', 'iCloud', 'Adobe CC'],
  'cat-personal-care': ['Sephora', 'Great Clips', 'CVS'],
  'cat-gifts': ['Amazon', 'Etsy', 'Hallmark'],
  'cat-travel': ['Delta Airlines', 'Airbnb', 'Expedia'],
};

const descriptions: Record<string, string[]> = {
  'cat-groceries': ['Weekly groceries', 'Snacks & drinks', 'Meal prep supplies', 'Pantry restock'],
  'cat-dining': ['Lunch out', 'Coffee run', 'Dinner with friends', 'Quick bite'],
  'cat-transport': ['Gas fill-up', 'Ride to work', 'Parking fee', 'Oil change'],
  'cat-entertainment': ['Movie night', 'Concert tickets', 'Game purchase', 'Streaming'],
  'cat-shopping': ['New shoes', 'Electronics', 'Clothes', 'Home supplies'],
  'cat-health': ['Prescription refill', 'Gym membership', 'Vitamins', 'Doctor copay'],
  'cat-utilities': ['Electric bill', 'Water bill', 'Internet bill', 'Phone bill'],
  'cat-housing': ['Monthly rent', 'Home repair', 'Furniture'],
  'cat-education': ['Online course', 'Textbook', 'Workshop fee'],
  'cat-subscriptions': ['Monthly subscription', 'Annual plan', 'Premium upgrade'],
  'cat-personal-care': ['Haircut', 'Skincare', 'Toiletries'],
  'cat-gifts': ['Birthday gift', 'Thank you gift', 'Holiday present'],
  'cat-travel': ['Flight booking', 'Hotel stay', 'Travel gear'],
};

const incomeDescriptions: Record<string, string[]> = {
  'cat-salary': ['Monthly salary', 'Paycheck'],
  'cat-freelance': ['Freelance project', 'Consulting fee', 'Side gig'],
  'cat-investments': ['Dividend payment', 'Stock sale', 'Interest income'],
  'cat-refunds': ['Store refund', 'Tax refund', 'Subscription refund'],
  'cat-other-income': ['Cash gift', 'Bonus', 'Reimbursement'],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export function generateSampleTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  // Generate 2 months of expense data (~4-6 transactions per day)
  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const date = subDays(now, dayOffset);
    const dateStr = format(date, 'yyyy-MM-dd');
    const numTx = Math.floor(Math.random() * 3) + 2; // 2-4 expenses per day

    for (let i = 0; i < numTx; i++) {
      const cat = pick(expenseCategories);
      const catMerchants = merchants[cat.id] || ['Store'];
      const catDescriptions = descriptions[cat.id] || ['Purchase'];

      transactions.push({
        id: uuid(),
        type: 'expense',
        amount: randomAmount(5, 120),
        categoryId: cat.id,
        description: pick(catDescriptions),
        merchant: pick(catMerchants),
        date: dateStr,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
      });
    }

    // Add occasional bigger expenses
    if (Math.random() < 0.15) {
      const cat = pick([
        expenseCategories.find(c => c.id === 'cat-housing')!,
        expenseCategories.find(c => c.id === 'cat-travel')!,
        expenseCategories.find(c => c.id === 'cat-shopping')!,
      ]);
      const catMerchants = merchants[cat.id] || ['Store'];
      const catDescriptions = descriptions[cat.id] || ['Purchase'];

      transactions.push({
        id: uuid(),
        type: 'expense',
        amount: randomAmount(150, 500),
        categoryId: cat.id,
        description: pick(catDescriptions),
        merchant: pick(catMerchants),
        date: dateStr,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
      });
    }
  }

  // Add monthly income (salary on ~1st and ~15th)
  for (let month = 0; month < 2; month++) {
    const salaryDate1 = subDays(now, month * 30 + 1);
    const salaryDate2 = subDays(now, month * 30 + 15);

    transactions.push({
      id: uuid(),
      type: 'income',
      amount: randomAmount(2500, 3500),
      categoryId: 'cat-salary',
      description: 'Monthly salary',
      merchant: 'Employer Inc.',
      date: format(salaryDate1, 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    });

    transactions.push({
      id: uuid(),
      type: 'income',
      amount: randomAmount(2500, 3500),
      categoryId: 'cat-salary',
      description: 'Paycheck',
      merchant: 'Employer Inc.',
      date: format(salaryDate2, 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    });
  }

  // Add occasional freelance income
  for (let i = 0; i < 4; i++) {
    const incomeCat = pick(incomeCategories.filter(c => c.id !== 'cat-salary'));
    const catDescriptions = incomeDescriptions[incomeCat.id] || ['Income'];

    transactions.push({
      id: uuid(),
      type: 'income',
      amount: randomAmount(200, 800),
      categoryId: incomeCat.id,
      description: pick(catDescriptions),
      merchant: pick(['Client A', 'Client B', 'Brokerage', 'PayPal']),
      date: format(subDays(now, Math.floor(Math.random() * 50)), 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    });
  }

  return transactions;
}

export function generateSampleBudgets(): Budget[] {
  const now = new Date().toISOString();
  return [
    { id: uuid(), categoryId: 'cat-groceries',     amount: 500,  period: 'monthly', createdAt: now, isActive: true },
    { id: uuid(), categoryId: 'cat-dining',         amount: 250,  period: 'monthly', createdAt: now, isActive: true },
    { id: uuid(), categoryId: 'cat-transport',      amount: 200,  period: 'monthly', createdAt: now, isActive: true },
    { id: uuid(), categoryId: 'cat-entertainment',  amount: 150,  period: 'monthly', createdAt: now, isActive: true },
    { id: uuid(), categoryId: 'cat-shopping',       amount: 400,  period: 'monthly', createdAt: now, isActive: true },
    { id: uuid(), categoryId: 'cat-utilities',      amount: 300,  period: 'monthly', createdAt: now, isActive: true },
    { id: uuid(), categoryId: 'cat-subscriptions',  amount: 80,   period: 'monthly', createdAt: now, isActive: true },
    { id: uuid(), categoryId: 'cat-housing',        amount: 2000, period: 'monthly', createdAt: now, isActive: true },
  ];
}

export function generateSampleGoals(): SavingsGoal[] {
  const now = new Date();
  return [
    {
      id: uuid(),
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 4200,
      icon: 'shield',
      color: '#10b981',
      createdAt: now.toISOString(),
    },
    {
      id: uuid(),
      name: 'Vacation Fund',
      targetAmount: 3000,
      currentAmount: 1800,
      deadline: format(addMonths(now, 6), 'yyyy-MM-dd'),
      icon: 'plane',
      color: '#0ea5e9',
      createdAt: now.toISOString(),
    },
    {
      id: uuid(),
      name: 'New Laptop',
      targetAmount: 2000,
      currentAmount: 1500,
      deadline: format(addMonths(now, 3), 'yyyy-MM-dd'),
      icon: 'laptop',
      color: '#6366f1',
      createdAt: now.toISOString(),
    },
    {
      id: uuid(),
      name: 'Investment Portfolio',
      targetAmount: 5000,
      currentAmount: 500,
      deadline: format(addMonths(now, 12), 'yyyy-MM-dd'),
      icon: 'trending-up',
      color: '#f59e0b',
      createdAt: now.toISOString(),
    },
  ];
}
