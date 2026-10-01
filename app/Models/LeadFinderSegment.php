<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeadFinderSegment extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_RETIRED = 'retired';

    protected $fillable = [
        'lead_finder_project_id',
        'name',
        'pain',
        'offer_angle',
        'criteria',
        'search_filters',
        'example_company_types',
        'fit_score',
        'fit_reason',
        'estimated_size',
        'is_enabled',
        'status',
        'companies_count',
    ];

    protected function casts(): array
    {
        return [
            'criteria' => 'array',
            'search_filters' => 'array',
            'example_company_types' => 'array',
            'is_enabled' => 'boolean',
            'fit_score' => 'integer',
            'companies_count' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(LeadFinderProject::class, 'lead_finder_project_id');
    }

    public function companies(): HasMany
    {
        return $this->hasMany(LeadFinderCompany::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(LeadFinderStep::class);
    }
}
