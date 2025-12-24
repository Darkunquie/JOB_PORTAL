#!/bin/bash

# Frontend Integration Test Script
# Tests all critical endpoints through the frontend nginx proxy

echo "======================================================================"
echo "FRONTEND INTEGRATION TEST"
echo "======================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost"
PASS_COUNT=0
FAIL_COUNT=0

# Function to test an endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_status="$4"
    local data="$5"

    echo -n "Testing: $name... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_status, got $status_code)"
        echo "Response: $body"
        ((FAIL_COUNT++))
        return 1
    fi
}

echo "1. STATIC CONTENT TESTS"
echo "----------------------------------------------------------------------"

# Test frontend HTML
test_endpoint "Frontend Index Page" "GET" "/" "200"

# Test static assets
test_endpoint "Frontend JS Asset" "GET" "/assets/index-CEDXauST.js" "200"
test_endpoint "Frontend CSS Asset" "GET" "/assets/index-6N2G4O13.css" "200"

echo ""
echo "2. API PROXY TESTS"
echo "----------------------------------------------------------------------"

# Test API endpoints through nginx proxy
test_endpoint "Health Check" "GET" "/health" "200"
test_endpoint "Jobs List" "GET" "/api/v1/jobs" "200"
test_endpoint "Jobs with Limit" "GET" "/api/v1/jobs?limit=5" "200"
test_endpoint "Companies List" "GET" "/api/v1/companies" "200"

echo ""
echo "3. AUTHENTICATION TESTS"
echo "----------------------------------------------------------------------"

# Test auth endpoints (should return 401 for /auth/me without token)
test_endpoint "Auth Me (No Token)" "GET" "/api/v1/auth/me" "401"

# Test login with invalid credentials (should return 401)
test_endpoint "Login Invalid Creds" "POST" "/api/v1/auth/login" "401" \
    '{"email":"invalid@test.com","password":"wrongpass"}'

echo ""
echo "4. FRONTEND ROUTING TESTS"
echo "----------------------------------------------------------------------"

# Test SPA routing (all these should return 200 and the index.html)
test_endpoint "Route: /login" "GET" "/login" "200"
test_endpoint "Route: /register" "GET" "/register" "200"
test_endpoint "Route: /dashboard" "GET" "/dashboard" "200"

echo ""
echo "5. ERROR HANDLING TESTS"
echo "----------------------------------------------------------------------"

# Test 404 API endpoint
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/nonexistent")
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" = "404" ]; then
    echo -e "Testing: API 404 Error... ${GREEN}✓ PASS${NC} (HTTP 404)"
    ((PASS_COUNT++))
else
    echo -e "Testing: API 404 Error... ${RED}✗ FAIL${NC} (Expected HTTP 404, got $status_code)"
    ((FAIL_COUNT++))
fi

echo ""
echo "6. PROXY CONFIGURATION TESTS"
echo "----------------------------------------------------------------------"

# Verify nginx is adding proper headers
headers=$(curl -s -I "$BASE_URL" | grep -E "(X-Frame-Options|X-Content-Type-Options)")
if [ ! -z "$headers" ]; then
    echo -e "Testing: Security Headers... ${GREEN}✓ PASS${NC}"
    echo "$headers" | sed 's/^/  /'
    ((PASS_COUNT++))
else
    echo -e "Testing: Security Headers... ${RED}✗ FAIL${NC}"
    ((FAIL_COUNT++))
fi

echo ""
echo "7. DOCKER HEALTH CHECKS"
echo "----------------------------------------------------------------------"

# Check container health
frontend_health=$(docker inspect jobmarket-frontend --format='{{.State.Health.Status}}' 2>/dev/null)
backend_health=$(docker inspect jobmarket-backend --format='{{.State.Health.Status}}' 2>/dev/null)
db_health=$(docker inspect jobmarket-db --format='{{.State.Health.Status}}' 2>/dev/null)

echo -n "Frontend Container Health: "
if [ "$frontend_health" = "healthy" ]; then
    echo -e "${GREEN}✓ HEALTHY${NC}"
    ((PASS_COUNT++))
else
    echo -e "${YELLOW}⚠ $frontend_health${NC}"
    ((FAIL_COUNT++))
fi

echo -n "Backend Container Health: "
if [ "$backend_health" = "healthy" ]; then
    echo -e "${GREEN}✓ HEALTHY${NC}"
    ((PASS_COUNT++))
else
    echo -e "${YELLOW}⚠ $backend_health${NC}"
    ((FAIL_COUNT++))
fi

echo -n "Database Container Health: "
if [ "$db_health" = "healthy" ]; then
    echo -e "${GREEN}✓ HEALTHY${NC}"
    ((PASS_COUNT++))
else
    echo -e "${YELLOW}⚠ $db_health${NC}"
    ((FAIL_COUNT++))
fi

echo ""
echo "======================================================================"
echo "TEST SUMMARY"
echo "======================================================================"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo ""
    echo "Frontend is successfully integrated and production-ready!"
    echo ""
    echo "Access points:"
    echo "  - Frontend:     http://localhost"
    echo "  - Backend API:  http://localhost:8000"
    echo "  - API Docs:     http://localhost:8000/api/docs"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please review the failures above."
    exit 1
fi
