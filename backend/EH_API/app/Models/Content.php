<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Content extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'content_type_id',
        'title',
        'summary',
        'content',
        'image',
        'video',
        'image_url',
        'video_url',
        'audio_url',
        'document_url',
        'visibility'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
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

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
