<?php

namespace App\Models;

use Database\Factories\SalesNavigatorLeadFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesNavigatorLead extends Model
{
    /** @use HasFactory<SalesNavigatorLeadFactory> */
    use HasFactory;

    public const STATUS_NOT_CONTACTED = 'not_contacted';

    public const STATUS_CONNECTED_NO_RESPONSE = 'connected_no_response';

    public const STATUS_REPLIED = 'replied';

    public const STATUS_DEAL = 'deal';

    public const STATUSES = [
        self::STATUS_NOT_CONTACTED,
        self::STATUS_CONNECTED_NO_RESPONSE,
        self::STATUS_REPLIED,
        self::STATUS_DEAL,
    ];

    protected $fillable = [
        'name',
        'title',
        'company',
        'company_url',
        'location',
        'profile_url',
        'connection_degree',
        'about',
        'status',
        'notes',
        'last_contacted_at',
        'added_by',
    ];

    protected function casts(): array
    {
        return [
            'last_contacted_at' => 'datetime',
        ];
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}
