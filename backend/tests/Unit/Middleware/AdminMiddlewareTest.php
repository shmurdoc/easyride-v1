<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\AdminMiddleware;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
    }

    public function test_admin_user_passes_through(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new AdminMiddleware;
        $response = $middleware->handle($request, fn ($req) => response('ok'));

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('ok', $response->getContent());
    }

    public function test_super_admin_user_passes_through(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new AdminMiddleware;
        $response = $middleware->handle($request, fn ($req) => response('ok'));

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_non_admin_user_gets_403(): void
    {
        $user = User::factory()->create();
        $user->assignRole('rider');

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new AdminMiddleware;
        $response = $middleware->handle($request, fn ($req) => response('ok'));

        $this->assertEquals(403, $response->getStatusCode());
        $this->assertJsonStringEqualsJsonString(
            '{"message":"Forbidden. Admin access required."}',
            $response->getContent()
        );
    }

    public function test_unauthenticated_user_gets_403(): void
    {
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => null);

        $middleware = new AdminMiddleware;
        $response = $middleware->handle($request, fn ($req) => response('ok'));

        $this->assertEquals(403, $response->getStatusCode());
        $this->assertJsonStringEqualsJsonString(
            '{"message":"Forbidden. Admin access required."}',
            $response->getContent()
        );
    }
}
