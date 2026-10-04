<?php

namespace App\Models;

use Database\Factories\SalesNavigatorLeadFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesNavigatorLead extends Model
{
    /** @use HasFactory<SalesNavigatorLeadFactory> */
    use HasFactory;

    /** @var array<int, string> */
    protected $appends = ['linkedin_profile_url'];

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

    /**
     * The regular (non-Sales Navigator) LinkedIn profile URL, derived from the
     * SN lead link. Sales Navigator's "/sales/lead/{id},NAME_SEARCH,..." path
     * embeds the member's real profile id ahead of the first comma; swapping
     * it onto "/in/" gives a plain profile link LinkedIn resolves on its own
     * (redirecting to the member's vanity URL if they have one), without
     * requiring Sales Navigator access to view it.
     */
    protected function linkedinProfileUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (! $this->profile_url) {
                    return null;
                }

                if (! preg_match('#^https://www\.linkedin\.com/sales/lead/([^,/?]+)#', $this->profile_url, $matches)) {
                    return $this->profile_url;
                }

                return "https://www.linkedin.com/in/{$matches[1]}";
            },
        );
    }
}
