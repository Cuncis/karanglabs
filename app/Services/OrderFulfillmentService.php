<?php

namespace App\Services;

use App\Mail\StudioAccessMail;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;

class OrderFulfillmentService
{
    public function __construct(private StudioAccountService $accounts) {}

    /**
     * Fulfill a paid order: mark it paid, provision the buyer's account, and
     * email their login details. Idempotent — safe to call from both the
     * Mayar webhook and the client-triggered finalize endpoint.
     */
    public function fulfill(Order $order): void
    {
        if ($order->isPaid()) {
            return;
        }

        $order->forceFill(['status' => 'paid', 'paid_at' => now()])->save();

        $result = $this->accounts->provisionFromOrder($order);
        $user = $result['user'];
        $order->forceFill(['user_id' => $user->id])->save();

        Mail::to($order->email)->send(new StudioAccessMail(
            $user,
            $result['password'],
            $user->isReseller() ? $user->license_key : null,
            $this->accounts->resellerDownloadUrl($user),
        ));
    }
}
