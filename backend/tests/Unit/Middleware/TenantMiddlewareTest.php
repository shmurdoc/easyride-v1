<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\TenantMiddleware;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class TenantMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_id_is_merged_when_user_has_tenant_id(): void
    {
        $user = User::factory()->create();

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new TenantMiddleware;
        $response = $middleware->handle($request, fn ($req) => response('ok'));

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals($user->tenant_id, $request->input('tenant_id'));
    }

    public function test_tenant_id_is_not_merged_when_user_has_no_tenant_id(): void
    {
        $user = User::factory()->create(['tenant_id' => null]);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new TenantMiddleware;
        $response = $middleware->handle($request, fn ($req) => response('ok'));

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertNull($request->input('tenant_id'));
    }

    public function test_unauthenticated_user_passes_through_without_modification(): void
    {
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => null);

        $middleware = new TenantMiddleware;
        $response = $middleware->handle($request, fn ($req) => response('ok'));

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertNull($request->input('tenant_id'));
    }
}
