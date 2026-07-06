<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Content extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'content_type_id',
        'title',
        'summary',
        'content',
        'image_url',
        'video_url',
        'audio_url',
        'document_url',
        'visibility',
        'views_count',
        'deleted_by',
    ];

    protected $casts = [
        'views_count' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function contentType()
    {
        return $this->belongsTo(ContentType::class);
    }

    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function savedByUsers()
    {
        return $this->hasMany(SavedContent::class);
    }

    public function savedContents()
    {
        return $this->hasMany(SavedContent::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(ContentSubscription::class);
    }

}
