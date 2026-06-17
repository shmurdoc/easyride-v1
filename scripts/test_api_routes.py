"""Basic smoke tests for API route accessibility."""
import subprocess
import sys
import os
import pytest


def test_backend_artisan_routes_defined():
    """Verify artisan route:list can run and returns routes."""
    backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
    if not os.path.exists(os.path.join(backend_dir, 'artisan')):
        pytest.skip("Backend artisan not found")

    result = subprocess.run(
        ['php', 'artisan', 'route:list'],
        capture_output=True, text=True, cwd=backend_dir, timeout=30
    )
    assert result.returncode == 0
    assert 'api/v1' in result.stdout or 'api/v1' in result.stderr


def test_scripts_import():
    """Verify Python route scripts can at least be imported without syntax errors."""
    scripts_dir = os.path.dirname(__file__)
    for f in ['test-routes.py', 'audit-routes.py']:
        path = os.path.join(scripts_dir, f)
        if os.path.exists(path):
            script = 'import ast; ast.parse(open(r"{}").read())'.format(path)
            result = subprocess.run(
                [sys.executable, '-c', script],
                capture_output=True, text=True, timeout=10
            )
            assert result.returncode == 0, f"{f} has syntax errors: {result.stderr}"
