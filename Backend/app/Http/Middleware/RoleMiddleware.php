<?php

namespace App\Http\Middleware;

use Closure;

class RoleMiddleware
{
    public function handle($request, Closure $next)
    {
        // Role middleware placeholder
        return $next($request);
    }
}
