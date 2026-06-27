<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Forum extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'rules',
        'category',
        'image_url',
        'visibility',
        'content_permission',
        'allow_attachments',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'allow_attachments' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function topics(): HasMany
    {
        return $this->hasMany(ForumTopic::class);
    }

    public function contents()
    {
        return $this->belongsToMany(Content::class, 'content_forum')
            ->withTimestamps();
    }
}
