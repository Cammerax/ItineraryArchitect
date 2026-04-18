import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      itinerary: { include: { location: true } },
    },
  });

  const total = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
        <p className="text-stone-500 text-sm">{orders.length} orders · {formatPrice(total)} total revenue</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left p-4 text-xs font-semibold text-stone-500 uppercase">Customer</th>
              <th className="text-left p-4 text-xs font-semibold text-stone-500 uppercase">Itinerary</th>
              <th className="text-left p-4 text-xs font-semibold text-stone-500 uppercase">Location</th>
              <th className="text-right p-4 text-xs font-semibold text-stone-500 uppercase">Amount</th>
              <th className="text-right p-4 text-xs font-semibold text-stone-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-stone-900">{o.user.name || "—"}</p>
                  <p className="text-xs text-stone-400">{o.user.email}</p>
                </td>
                <td className="p-4">
                  <p className="text-stone-700">{o.itinerary.title}</p>
                </td>
                <td className="p-4 text-stone-500">{o.itinerary.location.name}</td>
                <td className="p-4 text-right font-bold text-green-600">{formatPrice(o.amount)}</td>
                <td className="p-4 text-right text-stone-400 text-xs">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="h-10 w-10 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-400">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
