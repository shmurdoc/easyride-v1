# Project Charter

**Phase:** 01 — Initiation  
**Document:** Project Charter  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## 1. Vision

> **"Reliable, affordable transport for every person in Phalaborwa."**

EasyRyde will be the trusted mobility platform that connects Phalaborwa's people to the places they need to go — safely, affordably, and on demand. We exist because transport is not a luxury; it is access to work, healthcare, education, and community.

---

## 2. Mission

To launch and operate the first organised ride-hailing and food delivery platform in Phalaborwa, creating a reliable transport network that:

- Gets riders to their destinations safely and predictably
- Provides drivers with flexible, dignified earning opportunities
- Gives admin operators full visibility and control over operations
- Processes payments securely across cash and digital methods
- Delivers measurable social impact through job creation and safer transport

---

## 3. Core Values

| Value | Meaning |
|-------|---------|
| **Safety First** | Every ride is tracked, every driver verified, every incident followed up. We never compromise on safety. |
| **Local First** | Built for Phalaborwa — cash payments, local payment gateways, ZAR pricing. We serve our community. |
| **Reliability** | Rides arrive when promised. Drivers are dispatched fairly. The platform is always available. |
| **Transparency** | Clear pricing, clear earnings, clear policies. No hidden fees, no opaque algorithms. |
| **Dignity** | Every stakeholder — rider, driver, admin, restaurant — is treated with fairness and respect. |
| **Continuous Improvement** | We ship, measure, learn, iterate. Perfection is the enemy of launched. |

---

## 4. Stakeholders

| Role | Name / Group | Responsibilities | Expectations |
|------|-------------|------------------|--------------|
| **Project Sponsor** | CEO / Founder | Funding decisions, strategic direction, final signoff | Monthly progress update, escalation point for blockers |
| **Product Manager** | — | Scope, prioritisation, stakeholder communication, requirements | Daily standups, sprint planning, feature signoff |
| **Tech Lead** | — | Architecture decisions, code standards, tech debt management | Design reviews, code reviews, incident response |
| **Development Team** | 16 members (4 squads) | Implementation, testing, documentation | Sprint execution, quality gates, daily standups |
| **QA Lead** | — | Test strategy, manual + automated testing, quality gates | Test reports, bug triage, go/no-go recommendation |
| **Riders (End Users)** | Phalaborwa community | Product feedback, ratings, adoption | Working platform, fair pricing, safety |
| **Drivers** | Local vehicle owners | Service delivery, GPS data, feedback | Earning opportunity, fair dispatch, support |
| **Admin Operators** | Operations team | Daily system management, compliance | Functional dashboard, reporting, driver mgmt |
| **Restaurant Partners** | Local food establishments | Menu management, order fulfilment | Customer reach, delivery logistics |
| **Regulatory Bodies** | FICA, POPIA, SARS | Compliance oversight | Audited compliance, data protection |
| **Payment Partners** | Stripe, PayFast, Ozow | Transaction processing, settlement | PCI compliance, API stability, settlement SLAs |

---

## 5. Success Criteria

The project is deemed successful when ALL of the following criteria are met:

### 5.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| API p95 response time | <500ms | New Relic / custom middleware |
| WebSocket p95 latency | <200ms | Socket.io monitoring |
| Ride request → driver accept | <60s (p95) | Application tracking |
| App cold start time | <1s on mid-range device | Performance profiling |
| Database query p95 | <100ms | PostgreSQL slow query log |

### 5.2 Reliability

| Metric | Target | Measurement |
|--------|--------|-------------|
| Platform uptime (monthly) | 99.9% (43min max downtime) | Uptime monitoring |
| App crash-free rate | 99.9% of sessions | Sentry crash analytics |
| Payment success rate | >98% | Payment gateway reporting |
| Push notification delivery | >95% within 30s | FCM analytics |

### 5.3 Quality

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test coverage (backend) | >85% | PHPUnit coverage report |
| Test coverage (mobile) | >70% | Jest coverage report |
| E2E tests passing | 100% critical paths | Cypress / Detox |
| Security scan criticals | 0 | OWASP ZAP / Snyk |
| Accessibility score | >90 (admin dashboard) | Lighthouse |

### 5.4 Business

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily rides (Month 3) | 500 | Analytics |
| Active drivers (Month 3) | 50 | Platform data |
| Rider rating | 4.5+ | Average in-app rating |
| Driver retention (30-day) | >80% | Cohort analysis |
| Cancellation rate | <5% | Platform data |
| Customer support response | <2 hours | Helpdesk SLA |

---

## 6. Phase Gate Criteria

Each epic completion triggers a formal phase gate review before proceeding to the next epic.

### Gate 1: Production Hardening (Epic E1)

| Criterion | Pass/Fail |
|-----------|-----------|
| All env vars documented and in .env.example | ☐ |
| .gitignore reviewed for secrets | ☐ |
| CI/CD pipeline green (lint + test + build) | ☐ |
| Sentry + logging configured | ☐ |
| Rate limiting active on auth endpoints | ☐ |
| Security audit of committed credentials | ☐ |

### Gate 2: Payment Integration (Epic E2)

| Criterion | Pass/Fail |
|-----------|-----------|
| Stripe, PayFast, Ozow in sandbox test passes | ☐ |
| Escrow hold + release mechanism tested | ☐ |
| Refund flow tested (full + partial) | ☐ |
| Cash payment flow tested | ☐ |
| Driver payout batch process tested | ☐ |
| PCI compliance checklist signed off | ☐ |

### Gate 3: Real-Time & Notifications (Epic E3)

| Criterion | Pass/Fail |
|-----------|-----------|
| Socket.io connection with JWT auth | ☐ |
| GPS location streaming <5s interval | ☐ |
| Push notification delivery verified on iOS + Android | ☐ |
| In-app notification center functional | ☐ |
| SMS OTP delivery tested | ☐ |
| WebSocket reconnect logic tested | ☐ |

### Gate 4: Mobile UX & Edge Cases (Epic E4)

| Criterion | Pass/Fail |
|-----------|-----------|
| Ride lifecycle (all states) tested | ☐ |
| Scheduled ride creation and dispatch tested | ☐ |
| SOS button triggers admin alert | ☐ |
| Ride sharing generates shareable link | ☐ |
| Offline screen state handling | ☐ |
| 10+ device compatibility tested | ☐ |

### Gate 5: Admin Dashboard & Food (Epic E5)

| Criterion | Pass/Fail |
|-----------|-----------|
| Driver approval workflow end-to-end | ☐ |
| Pricing editor saves and applies correctly | ☐ |
| Dashboard KPIs match database counts | ☐ |
| Food order lifecycle tested | ☐ |
| Audit log captures all admin actions | ☐ |
| Promo code creation + application tested | ☐ |

### Gate 6: Testing & QA (Epic E6)

| Criterion | Pass/Fail |
|-----------|-----------|
| 85%+ backend test coverage | ☐ |
| Load test: 100 concurrent rides | ☐ |
| Security scan: 0 criticals | ☐ |
| E2E tests covering 3 critical flows | ☐ |
| Regression suite passing | ☐ |
| Beta user testing completed with 10+ users | ☐ |

### Gate 7: Deployment & Operations (Epic E7)

| Criterion | Pass/Fail |
|-----------|-----------|
| Production deployment playbook written | ☐ |
| Rollback procedure documented and tested | ☐ |
| Monitoring dashboards live | ☐ |
| Database backup + recovery tested | ☐ |
| Business continuity plan in place | ☐ |
| GO / NO-GO decision by stakeholders | ☐ |

---

## 7. Escalation Path

| Level | Who | Decisions | Response Time |
|-------|-----|-----------|---------------|
| **Level 1 — Daily** | Tech Lead + PM | Technical decisions, sprint scope, bug priority | Within 4 hours |
| **Level 2 — Weekly** | Steering Committee (Sponsor + Tech Lead + PM) | Scope changes, resource reallocation, timeline adjustments | Within 1 week |
| **Level 3 — Emergency** | Project Sponsor | Budget overrun >10%, critical security incident, legal/compliance issue | Within 24 hours |
| **Level 4 — Crisis** | CEO / Founder | GO / NO-GO decision, platform shutdown, public communication | Within 2 hours |

### Escalation Rules

1. **Unblocked escalation**: Any team member can escalate at any level if they believe a blocker requires attention
2. **No-blame culture**: Escalation is encouraged, never penalised
3. **Escalation response**: The responder must acknowledge within the defined response time
4. **Documentation**: Every escalation is logged with outcome in the project management tool
5. **Security escalations**: Bypass normal hierarchy — report directly to Tech Lead + Sponsor

---

## 8. Key Milestones

| Milestone | Target Date | Deliverable |
|-----------|-------------|-------------|
| Project kickoff | 2026-06-17 | Charter signed, team mobilised |
| Phase 1 & 2 complete | 2026-06-20 | All initiation + requirements docs approved |
| System design complete | 2026-06-27 | Architecture, data model, API contracts |
| Epic E1 complete | 2026-07-04 | Production hardening, CI/CD, monitoring |
| Epic E2 complete | 2026-07-18 | Payment integration (sandbox test pass) |
| Epic E3 complete | 2026-07-28 | Real-time + notifications |
| Epic E4 complete | 2026-08-15 | Mobile UX, edge cases |
| Epic E5 complete | 2026-08-25 | Admin dashboard, food delivery |
| Epic E6 complete | 2026-09-05 | Testing, QA, beta |
| Epic E7 complete | 2026-09-12 | Deployment, operations |
| **Production launch** | **2026-09-15** | **GO decision** |

---

## 9. Budget Authority

| Role | Authority Limit |
|------|----------------|
| Tech Lead | Capex up to R5,000 without approval |
| Product Manager | Capex up to R15,000 without approval |
| Steering Committee | Capex up to R100,000 |
| Project Sponsor | Any amount |

---

## 10. Charter Acceptance

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor | | | |
| Product Manager | | | |
| Tech Lead | | | |
| QA Lead | | | |

---

*This charter is a living document. Amendments require steering committee approval.*
