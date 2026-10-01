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

    public const STATUS_MESSAGE_1_SENT = 'message_1_sent';

    public const STATUS_MESSAGE_2_SENT = 'message_2_sent';

    public const STATUS_MESSAGE_3_SENT = 'message_3_sent';

    public const STATUS_CONNECTED_NO_RESPONSE = 'connected_no_response';

    public const STATUS_REPLIED = 'replied';

    public const STATUSES = [
        self::STATUS_NOT_CONTACTED,
        self::STATUS_MESSAGE_1_SENT,
        self::STATUS_MESSAGE_2_SENT,
        self::STATUS_MESSAGE_3_SENT,
        self::STATUS_CONNECTED_NO_RESPONSE,
        self::STATUS_REPLIED,
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
