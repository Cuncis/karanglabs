<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadFinderCompany extends Model
{
    public const SOURCE_MAP = 'map';

    public const SOURCE_PASTE = 'paste';

    public const SOURCE_CSV = 'csv';

    protected $fillable = [
        'lead_finder_segment_id',
        'source',
        'name',
        'website',
        'domain',
        'location',
        'country',
        'email',
        'contact_name',
        'contact_title',
    ];

    public function segment(): BelongsTo
    {
        return $this->belongsTo(LeadFinderSegment::class, 'lead_finder_segment_id');
    }
}
