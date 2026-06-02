#!/usr/bin/env python3
"""
Audit API routes for the wildcard-vs-literal ordering bug.

Bug: In Laravel, if a literal route like `GET /payments/methods` is registered
AFTER a wildcard like `GET /payments/{payment}`, requests to `/payments/methods`
will match the wildcard with $payment="methods" instead of the literal route.

We look for: in the same Route::prefix() group, a literal route that could be
shadowed by a wildcard route registered earlier with the same HTTP verb.
"""
import re
import sys
from pathlib import Path
from collections import defaultdict

ROUTES_FILE = Path("F:/EasyRyde/backend/routes/api.php")
ROUTE_LIST = Path("C:/Users/madoc/AppData/Local/Temp/routes.log")  # artisan route:list

def parse_artisan_routes(text: str):
    """Returns list of (method, path) tuples from artisan route:list output."""
    out = []
    for line in text.splitlines():
        line = line.rstrip()
        # Match lines like: "  GET|HEAD        api/v1/payments/methods ... Api\V1\PaymentController@methods"
        m = re.match(r"^\s+(GET\|HEAD|GET|HEAD|POST|PUT|PATCH|DELETE)\s+(api/v\d/\S+?)(?:\s+\S+)+$", line)
        if m:
            method = m.group(1).replace("|HEAD", "").split("|")[0]
            path = m.group(2)
            out.append((method, path))
    return out

def group_prefix(path: str) -> str:
    """Strip the last segment so we group by prefix."""
    parts = path.split("/")
    if len(parts) > 1:
        return "/".join(parts[:-1])
    return path

def audit(routes):
    """For each prefix group, check for literal-after-wildcard bug."""
    groups = defaultdict(list)
    for method, path in routes:
        groups[(group_prefix(path), method)].append(path)

    findings = []
    for (prefix, method), paths in groups.items():
        if len(paths) < 2:
            continue
        # Find first wildcard occurrence
        wildcard_idx = None
        for i, p in enumerate(paths):
            if "{" in p:
                wildcard_idx = i
                break
        if wildcard_idx is None:
            continue
        # Find any literal that comes AFTER the wildcard AND would be matched by it
        # i.e. a literal whose last segment is the same as the wildcard's last segment shape
        wildcard_path = paths[wildcard_idx]
        # Get the wildcard pattern: e.g. "api/v1/payments/{payment}" -> "{payment}" is wildcard
        wparts = wildcard_path.split("/")
        for p in paths[wildcard_idx + 1:]:
            pparts = p.split("/")
            if len(pparts) != len(wparts):
                continue
            # Check if literal's last segment doesn't contain a { and could be shadowed
            literal_last = pparts[-1]
            wildcard_last = wparts[-1]
            if "{" not in wildcard_last and "{" not in literal_last:
                # Both are literals, no conflict
                continue
            if "{" in literal_last:
                # Both wildcards, no conflict (different IDs)
                continue
            # Literal is shadowed by wildcard
            findings.append((method, prefix, wildcard_path, p))
    return findings

def main():
    if not ROUTE_LIST.exists():
        print(f"ERR: {ROUTE_LIST} not found. Run: docker exec easyryde-app-1 php artisan route:list --path=api")
        sys.exit(1)
    text = ROUTE_LIST.read_text(encoding="utf-16-le", errors="replace")
    routes = parse_artisan_routes(text)
    print(f"Parsed {len(routes)} routes from artisan route:list")
    findings = audit(routes)
    if not findings:
        print("\nPASS: No literal-after-wildcard shadowing detected in any prefix group.")
        sys.exit(0)
    print(f"\nFAIL: Found {len(findings)} potential shadowed route(s):")
    for method, prefix, wcard, lit in findings:
        print(f"  [{method}] in {prefix}/")
        print(f"    wildcard registered first: {wcard}")
        print(f"    literal shadowed:          {lit}")
    sys.exit(1)

if __name__ == "__main__":
    main()
