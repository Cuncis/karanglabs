<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\StudioAccessMail;
use App\Models\Order;
use App\Services\StudioAccountService;
use App\Support\WhitelabelPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(private StudioAccountService $accounts) {}

    /**
     * List all orders with a few headline stats.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Orders', [
            'orders' => Order::latest()->limit(200)->get([
                'id', 'order_id', 'name', 'email', 'phone', 'plan', 'amount', 'status', 'paid_at', 'created_at',
            ]),
            'stats' => [
                'total' => Order::count(),
                'paid' => Order::where('status', 'paid')->count(),
                'revenue' => (int) Order::where('status', 'paid')->sum('amount'),
            ],
            'hasPackage' => WhitelabelPackage::configured(),
        ]);
    }

    /**
     * Re-send login credentials for a paid order (regenerates the password).
     */
    public function resend(Order $order): RedirectResponse
    {
        abort_unless($order->isPaid(), 422, 'Order belum lunas.');

        $provision = $this->accounts->provisionFromOrder($order);
        $user = $provision['user'];
        $order->forceFill(['user_id' => $user->id])->save();

        $password = $this->accounts->resetPassword($user);

        Mail::to($order->email)->send(new StudioAccessMail(
            $user,
            $password,
            $user->isReseller() ? $user->license_key : null,
            $this->accounts->resellerDownloadUrl($user),
        ));

        return back()->with('success', 'Email login dikirim ulang ke '.$order->email.'.');
    }
}
