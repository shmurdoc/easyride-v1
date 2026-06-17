# Maintenance Roadmap

## 1. Timeline

### Phase 1 — Active Development (Weeks 1–10)

Full-stack development of the EasyRyde platform:

| Week | Focus |
|------|-------|
| 1 | Backend core: ride lifecycle, user auth, basic Laravel setup |
| 2 | Driver management, vehicle registration, admin dashboard foundation |
| 3 | Rider mobile app: booking flow, real-time tracking, payment integration |
| 4 | Driver mobile app: trip acceptance, navigation, earnings view |
| 5 | Admin dashboard: mapping, user management, support ticket system |
| 6 | Food delivery module: restaurant onboarding, order lifecycle |
| 7 | Notifications (push, SMS, in-app), WebSocket reliability hardening |
| 8 | Operations documentation, support model, monitoring setup |
| 9 | Governance docs, compliance, security hardening, stress testing |
| 10 | Final audit, bug bash, load testing, sign-off preparation |

### Phase 2 — Closed Beta (Week 11)

Controlled test with real users:

- **50 invited riders**: Recruited from Phalaborwa WhatsApp groups and community forums.
- **10 drivers**: Pre-vetted, trained on app usage, paid a guaranteed minimum for participation.
- **Scope**: Ride-hailing only (no food delivery during beta). Phalaborwa CBD and surrounding residential areas.
- **Monitoring**: Daily standup at 9AM SAST with founder, lead engineer, and 2 selected beta testers.
- **Metrics tracked**: Ride completion rate, average wait time, driver acceptance rate, app crash rate, support ticket volume.
- **Exit criteria**:
  - Ride completion rate > 85%
  - Average wait time < 12 minutes
  - App crash rate < 0.5%
  - All Critical and High bugs resolved
  - Support ticket volume declining week-over-week

### Phase 3 — Soft Launch (Weeks 12–13)

Public but limited:

- **Public availability**: App listed on Google Play Store and Apple App Store. No marketing spend yet.
- **Driver fleet**: 20 drivers online (recruited via word-of-mouth, targeted Facebook posts).
- **Service area**: Phalaborwa CBD (+ 5km radius). Food delivery added with 5 restaurant partners.
- **Pricing**: Promotional pricing (50% platform fee waived) for first 1000 rides.
- **Support**: Dedicated admin support 6AM–10PM daily. Founder on-call for escalation.
- **Goal**: Validate market fit, identify operational bottlenecks, refine processes before marketing push.

### Phase 4 — Full Launch (Week 14+)

Scaling up:

- **Marketing campaign**: Facebook/Instagram ads targeting Phalaborwa (ZAR 15,000 budget). Flyers at taxi ranks, malls, and university campus.
- **Referral bonuses**: ZAR 50 credit for each referred rider (after first ride). ZAR 200 bonus for each referred driver (after 10 completed rides).
- **Driver recruitment**: Onboarding target of 50 drivers by end of week 16. Recruitment via driver referral bonus + targeted ads.
- **Service area**: Extended to Namakgale, Lulekani, and Gravelotte (surrounding townships).
- **Target metrics**:
  - 500+ active riders
  - 50+ active drivers
  - 1000+ completed rides per week
  - < 10 minute average wait time
  - 4.5+ average rating (rider and driver)

---

## 2. Post-Launch Feature Roadmap

### Month 2–3: v1.1

| Feature | Description | Priority |
|---------|-------------|----------|
| Scheduled rides polish | Ability to book rides up to 7 days in advance. Driver push notification 30 minutes before pickup. | High |
| Improved surge pricing | Time-of-day base multipliers. Event-based surge (sporting events, concerts). Weather integration. | High |
| Refer-a-friend tracking | Dashboard showing referral status, credits earned, payout history. | Medium |
| Ride pooling | Basic ride pooling with 2-passenger limit. Lower fare for riders, higher earnings per trip for drivers. | Medium |
| Driver earnings dashboard | In-app breakdown of earnings (base fare × tips × surge × promotions). Weekly payout history. | Medium |
| Admin performance analytics | Average wait time trends, driver acceptance rate trends, cancellation rate breakdown by reason. | Low |

### Month 4–6: v1.2

| Feature | Description | Priority |
|---------|-------------|----------|
| Multi-language | Full i18n for Afrikaans, Tsonga, and Sotho. Dynamic language switching. Voice prompts in rider's chosen language. | High |
| In-app call masking | Rider and driver communicate via masked phone numbers. No personal numbers exposed. Powered by Twilio or similar. | High |
| Advanced analytics | Cohort analysis (retention by week), funnel analysis (booking → completion), driver churn prediction. | Medium |
| Driver incentives system | Automated bonus triggers: ZAR X extra per ride during peak hours, streak bonuses (5 rides in a row = ZAR Y). | Medium |
| Rider subscriptions | Monthly subscription: flat fee for unlimited rides under ZAR 30. Predictable revenue, increased rider loyalty. | Low |
| Tip pre-selection | Tip suggestions at ride end (ZAR 5, 10, 20) displayed prominently. Optional custom tip. | Low |
| Loyalty program | Points per ride → redeem for free rides. Tiered (Bronze/Silver/Gold) with increasing benefits. | Low |

### Quarter 3+: Expansion

| Initiative | Description | Timeline |
|------------|-------------|----------|
| Township expansion | Service area extended to Majeje, Mashishimale, and Calcutta. Driver recruitment drives with local community leaders. | Q3 |
| Parcel delivery | Separate "Parcel" ride type. Rider is just a sender, driver picks up and delivers to recipient. Tracking link sent to recipient via WhatsApp. | Q3 |
| Restaurant partnerships | Active recruitment of 20+ restaurants. Dashboard for restaurants to accept/decline orders. | Q3 |
| Enterprise/corporate accounts | Monthly invoicing for companies. Admin dashboard for corporate ride management. Driver assignment priority for corporate rides. | Q4 |
| In-app wallet top-up | Pre-pay balance via EFT or card. Instant ride payments from wallet. No per-ride card transaction fees. | Q4 |
| Public transport integration | Display bus/taxi routes alongside ride-hailing options. Hybrid trip planning. | 2027 |

---

## 3. Maintenance Windows

### Scheduled Maintenance

| Detail | Value |
|--------|-------|
| Day | Wednesday |
| Time | 02:00–04:00 SAST |
| Frequency | Weekly (as needed, not every week) |
| Notification | Push notification + in-app banner at least 2 hours before. |
| Scope | Database migrations, Redis cache flush, server updates, deployment of non-critical releases. |
| Downtime | Target < 15 minutes. Full window reserved for rollback if needed. |

### Emergency Maintenance

| Detail | Value |
|--------|-------|
| Trigger | Critical security vulnerability, production outage, data corruption risk. |
| Notification | Push notification to all active users with 15-minute notice. SMS to all drivers with active rides (advising to complete current ride). |
| Duration | As long as necessary, but founder/lead engineer must provide an ETA within 15 minutes of declaring emergency. |
| Post-mortem | Written within 24 hours. Shared with entire team. |

### Change Advisory Board (CAB)

For post-launch phase:

- **Regular changes** (scheduled during maintenance window): No CAB needed. Automated CI/CD deploy.
- **Standard changes** (new feature, non-critical bug fix): CAB via Slack thread. Founder approves.
- **Emergency changes**: Post-hoc CAB within 24 hours. Founder and lead engineer required.

---

## 4. Release Naming Convention

| Env | Naming | Deploy Trigger |
|-----|--------|----------------|
| Development | `dev-{branch}` | Every push |
| Staging | `staging-{version}` | PR merged to `develop` |
| Production | `v{MAJOR}.{MINOR}.{PATCH}` | Founder approves release candidate |

Version bumps:

- **MAJOR**: Breaking API changes, database schema changes requiring migration rollback plan.
- **MINOR**: New features, non-breaking API additions.
- **PATCH**: Bug fixes, performance improvements, security patches.
