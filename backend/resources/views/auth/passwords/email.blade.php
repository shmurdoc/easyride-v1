@extends('layouts.guest')

@section('title', 'Forgot Password')

@section('content')
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                <i data-lucide="lock" class="w-6 h-6 text-indigo-600"></i>
            </div>
            <h2 class="text-xl font-semibold text-gray-900">Forgot Password?</h2>
            <p class="text-sm text-gray-500 mt-1">No worries. Enter your email and we'll send you a reset link.</p>
        </div>

        @if (session('status'))
            <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{{ session('status') }}</div>
        @endif

        <form method="POST" action="{{ route('password.email') }}">
            @csrf

            <div class="space-y-5">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400 @error('email') border-red-400 @enderror"
                        placeholder="you@example.com">
                    @error('email')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm">
                    Send Reset Link
                </button>
            </div>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
            <a href="{{ route('login') }}" class="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to sign in
            </a>
        </p>
    </div>
@endsection