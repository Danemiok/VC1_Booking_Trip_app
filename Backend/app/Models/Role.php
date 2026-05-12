<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    // ─── Primary Key ──────────────────────────────
    // Required: your PK is role_id, not the default 'id'
    protected $primaryKey = 'role_id';

    // ─── Fillable ─────────────────────────────────
    protected $fillable = [
        'name',
        'description',
    ];

    // ─── Relationships ────────────────────────────

    /**
     * Role has many Users
     * FK: users.role_id → roles.role_id
     */
    public function users(): HasMany
    {
        return $this->hasMany(
            User::class,
            'role_id',  // FK on users table
            'role_id'   // PK on roles table
        );
    }

    // ─── Helpers ──────────────────────────────────

    /**
     * Find a role by name quickly
     */
    public static function findByName(string $name): ?self
    {
        return static::where('name', $name)->first();
    }

    /**
     * Count users in this role
     */
    public function userCount(): int
    {
        return $this->users()->count();
    }
}