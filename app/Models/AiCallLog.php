<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiCallLog extends Model
{
    public const STATUS_SUCCEEDED = 'succeeded';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'user_id',
        'lead_finder_project_id',
        'step',
        'model',
        'prompt',
        'response',
        'input_tokens',
        'output_tokens',
        'cost_usd',
        'latency_ms',
        'status',
        'error_message',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(LeadFinderProject::class, 'lead_finder_project_id');
    }
}
