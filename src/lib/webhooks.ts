export async function notifyOrderStatusChange(orderId: string) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhook/order-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-token': process.env.INTERNAL_WEBHOOK_SECRET!,
        },
        body: JSON.stringify({ orderId }),
      });
    } catch (err) {
      console.error('notifyOrderStatusChange error:', err);
    }
  }