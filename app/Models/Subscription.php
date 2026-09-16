<?php

namespace App\Models;

use Database\Factories\SubscriptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    /** @use HasFactory<SubscriptionFactory> */
    use HasFactory;

    public const TIER_TOOLS = 'tools';

    public const TIER_BUNDLE = 'bundle';

    public const STATUS_PENDING = 'pending';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_STOPPED = 'stopped';

    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'email',
        'name',
        'phone',
        'tier',
        'status',
        'mayar_member_id',
        'mayar_product_id',
        'next_payment_at',
        'expires_at',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'next_payment_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function grantsStudioAccess(): bool
    {
        return $this->tier === self::TIER_BUNDLE && $this->isActive();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
