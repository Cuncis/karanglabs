<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadFinderStep extends Model
{
    public const STEP_FETCH_PROFILE = 'fetch_profile';

    public const STEP_SEGMENTS = 'segments';

    public const STEP_FIND_COMPANIES_MAP = 'find_companies_map';

    public const STATUS_PENDING = 'pending';

    public const STATUS_RUNNING = 'running';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'lead_finder_project_id',
        'lead_finder_segment_id',
        'step',
        'status',
        'failure_reason',
        'note',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(LeadFinderProject::class, 'lead_finder_project_id');
    }

    public function segment(): BelongsTo
    {
        return $this->belongsTo(LeadFinderSegment::class, 'lead_finder_segment_id');
    }

    public function markRunning(): void
    {
        $this->update(['status' => self::STATUS_RUNNING, 'started_at' => now()]);
    }

    public function markCompleted(?string $note = null): void
    {
        $this->update(['status' => self::STATUS_COMPLETED, 'note' => $note, 'completed_at' => now()]);
    }

    public function markFailed(string $reason): void
    {
        $this->update(['status' => self::STATUS_FAILED, 'failure_reason' => $reason, 'completed_at' => now()]);
    }
}
