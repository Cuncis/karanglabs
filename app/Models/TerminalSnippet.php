<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Str;

class TerminalSnippet extends Model
{
    protected $fillable = ['slug', 'user_id', 'title', 'content'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($snippet) {
            if (empty($snippet->slug)) {
                $snippet->slug = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
