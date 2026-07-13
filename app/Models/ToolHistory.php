<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ToolHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tool_slug',
        'inputs',
        'outputs',
    ];

    protected $casts = [
        'inputs' => 'array',
        'outputs' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
