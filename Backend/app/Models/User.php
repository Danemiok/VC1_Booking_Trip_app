<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // ─── Fillable ─────────────────────────────────
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'status',
        'phone_number',
        'google_id',
        'email_verified_at',
    ];

    // ─── Hidden ───────────────────────────────────
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // ─── Casts ────────────────────────────────────
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    // ─── Relationships ────────────────────────────

    /**
     * User belongs to one Role
     * FK: users.role_id → roles.role_id
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(
            Role::class,
            'role_id',  // FK on users table
            'role_id'   // PK on roles table
        );
    }

    /**
     * User has one OwnerProfile
     */
    public function ownerProfile(): HasOne
    {
        return $this->hasOne(OwnerProfile::class);
    }

    /**
     * User has many Accommodations (as owner)
     */
    public function accommodations(): HasMany
    {
        return $this->hasMany(Accommodation::class, 'owner_id');
    }

    // ─── Role Helpers ─────────────────────────────

    public function hasRole(string $roleName): bool
    {
        return $this->role?->name === $roleName;
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isCustomer(): bool
    {
        return $this->hasRole('customer');
    }

    public function isOwner(): bool
    {
        return $this->hasRole('owner');
    }

    // ─── Status Helpers ───────────────────────────

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isBanned(): bool
    {
        return $this->status === 'banned';
    }
}