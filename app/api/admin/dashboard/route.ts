import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';

// GET aggregated dashboard KPIs
export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const [[todaySales], [monthSales], [monthExpenses], customers, lowStock, outOfStock, pendingOrders, pendingPayments, [totalCustomers], [totalProducts]] = await Promise.all([
    query(`SELECT COALESCE(SUM(total),0) as total, COALESCE(SUM(paid),0) as paid, COALESCE(SUM(balance),0) as balance, COUNT(*) as count FROM invoices WHERE DATE(created_at)=? AND status!='cancelled'`, [today]) as Promise<any[]>,
    query(`SELECT COALESCE(SUM(total),0) as total, COALESCE(SUM(paid),0) as paid, COUNT(*) as count FROM invoices WHERE DATE_FORMAT(created_at,'%Y-%m')=? AND status!='cancelled'`, [month]) as Promise<any[]>,
    query(`SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE DATE_FORMAT(expense_date,'%Y-%m')=?`, [month]) as Promise<any[]>,
    query(`SELECT COUNT(*) as count FROM customers WHERE DATE(created_at)=?`, [today]) as Promise<any[]>,
    query(`SELECT id,name,brand,product_code,category,stock,low_stock_threshold FROM products WHERE stock>0 AND stock<=low_stock_threshold AND status='active' ORDER BY stock LIMIT 20`) as Promise<any[]>,
    query(`SELECT id,name,brand,product_code,category FROM products WHERE stock=0 AND status='active' LIMIT 20`) as Promise<any[]>,
    query(`SELECT * FROM invoices WHERE order_status IS NOT NULL AND order_status NOT IN ('delivered','cancelled') ORDER BY expected_date ASC LIMIT 20`) as Promise<any[]>,
    query(`SELECT * FROM invoices WHERE balance>0 AND status!='cancelled' ORDER BY created_at ASC LIMIT 20`) as Promise<any[]>,
    query(`SELECT COUNT(*) as count FROM customers`) as Promise<any[]>,
    query(`SELECT COUNT(*) as count, COALESCE(SUM(stock*purchase_price),0) as inventory_value FROM products WHERE status='active'`) as Promise<any[]>,
  ]);

  return NextResponse.json({
    today: todaySales,
    month: monthSales,
    month_expenses: monthExpenses,
    new_customers_today: customers[0]?.count ?? 0,
    low_stock: lowStock,
    out_of_stock: outOfStock,
    pending_orders: pendingOrders,
    pending_payments: pendingPayments,
    total_customers: totalCustomers.count,
    total_products: totalProducts.count,
    inventory_value: totalProducts.inventory_value,
  });
}
