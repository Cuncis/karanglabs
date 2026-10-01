<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeadFinderProject extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_RUNNING = 'running';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'user_id',
        'source_url',
        'status',
        'failure_reason',
        'profile',
    ];

    protected function casts(): array
    {
        return [
            'profile' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(LeadFinderStep::class);
    }

    public function segments(): HasMany
    {
        return $this->hasMany(LeadFinderSegment::class);
    }

    public function aiCallLogs(): HasMany
    {
        return $this->hasMany(AiCallLog::class);
    }
}
