# Support Model

## 1. Rider Support

### Channels

| Channel | Description | Availability |
|---------|-------------|-------------|
| In-app FAQ | Searchable knowledge base covering common issues | 24/7 self-service |
| In-app contact form | Submits structured issue to admin dashboard | 24/7 |
| SOS button | Emergency alert pushes directly to admin with live location | 24/7 |
| WhatsApp/SMS | Phone number displayed in app for urgent time-sensitive issues | Business hours (6AM-10PM SAST) |

### Tier Structure

#### Tier 1 — Self-Service (rider-facing FAQ)

Available in the app's Help section. Covers:

- **Lost item**: Steps to recover item from last vehicle. Admin must be contacted within 2 hours if driver unreachable.
- **Cancel ride**: How to cancel without penalty (within first 2 minutes of driver assignment). Fee schedule for late cancellation.
- **Payment issue**: Charged but ride not completed? Double charge? Incomplete charge? Guided flow to submit dispute with ride ID.
- **Driver no-show**: How to report and request refund. Automatic refund if driver has not moved for 5+ minutes after accepting.
- **Account issue**: Password reset, phone number change, email update. Links to profile settings.
- **Safety concern**: How to use SOS. What happens when SOS is activated. Steps to share trip with trusted contact.
- **Fare estimate**: Why final fare differs from estimate (wait time, route change, surge multiplier).

#### Tier 2 — Admin Support (via admin dashboard)

When Tier 1 cannot resolve, rider submits a ticket via contact form. Fields:

- Issue category (Payment, Safety, Driver, Account, Other)
- Ride ID (if applicable)
- Free-text description
- Optional screenshot attachment

Admin dashboard displays tickets in priority order:

- **Critical**: SOS alerts (red banner, audible alert on admin dashboard). Opens with map showing rider's last known location.
- **High**: Payment disputes, safety concerns (non-SOS). 1-hour response target.
- **Normal**: Lost items, account issues, general inquiries. 4-hour response target.
- **Low**: Feature requests, compliments. 48-hour response target.

Admin can reply via:

- **In-app chat**: Real-time messaging between admin and rider. Messages stored in the `chat_messages` table for audit trail.
- **WhatsApp fallback**: If rider is unresponsive in-app, admin can send WhatsApp message via the configured business WhatsApp number.

#### Tier 3 — Escalation (founder / lead engineer)

Reserved for:

- **Payment disputes > ZAR 500**: Manual review of ride logs, payment gateway records, and admin notes.
- **Safety incidents**: Physical altercation, accident, or harassment. Rider contacted by phone within 10 minutes. Driver suspended pending investigation.
- **Legal issues**: Subpoena, law enforcement request, insurance claim. Founder manages directly with legal counsel.
- **System-wide outage**: Lead engineer paged via SMS + phone call. Recovery procedure per business continuity plan.

---

## 2. Driver Support

### Channels

- **In-app Driver Help Center**: FAQ and guided troubleshooting.
- **Earnings dispute form**: Structured form to flag specific ride payouts.
- **Document upload**: For re-verification or updated documents (new license, vehicle change).

### Tier Structure

#### Tier 1 — Self-Service (driver FAQ)

- **Earnings**: How payout calculation works (base fare × distance multiplier + time multiplier + surge). When earnings are disbursed (weekly, Wednesdays). Why a ride payout is lower than expected (cancellation, waiting time threshold not met).
- **Ride acceptance**: What happens when acceptance rate drops below threshold. How auto-assignment prioritizes nearby drivers.
- **Vehicle requirements**: Acceptable vehicle types. How to update vehicle details. Document expiry reminders.
- **Account status**: Why account is under review. How to resolve document rejection. Suspension appeal process.

#### Tier 2 — Admin Review

Admin handles:

- **Document rejection**: Admin reviews uploaded documents, provides rejection reason, and prompts re-upload.
- **Fare disputes**: Admin compares actual route (from GPS logs) to estimated route. Adjusts payout manually if driver was unfairly routed. Logged in `payout_adjustments` table.
- **Account suspension**: Review of driver behaviour score, rider complaints, and ride history. Admin can suspend, warn, or reinstate.
- **Vehicle approval**: New vehicle registration review. Admin verifies photos, license plate, and roadworthiness documents.

#### Tier 3 — Escalation (founder / lead engineer)

- **Manual payout processing**: If automated batch payout fails (bank error, insufficient funds, Gateway API failure), founder initiates manual payout via banking app. Documented in `manual_payouts` table.
- **Safety incident follow-up**: Driver involved in accident or altercation. Founder communicates directly. Legal referral if needed.
- **Deactivation appeal**: Driver deactivated for severe violation (fraud, assault) can appeal directly to founder. Final decision, no further escalation.

---

## 3. Admin Support

### Philosophy

Admin dashboard is the support tool itself. There is no external support for admins — they are the operator. The system is designed so admins can resolve the vast majority of issues without developer intervention.

### Admin Training

| Training Component | Format | Frequency |
|-------------------|--------|-----------|
| Operations manual | Document (to be written) | Read before first shift |
| Walkthrough video | 15-minute screen recording covering dashboard core flows | Watch before first shift |
| Weekly check-in call | 30-minute call with founder | Weekly during first month, bi-weekly thereafter |
| Escalation protocol cheat sheet | Single-page PDF with phone numbers, runbooks | Printed and posted at workstation |

### Admin Tools Built Into Dashboard

- **Ticket management**: Create, assign, reply, close, escalate tickets.
- **User lookup**: Search by phone, email, or rider/driver ID. View ride history, payment history, current status.
- **Live map**: View all active rides and driver locations. Click to see rider/driver details.
- **Payout management**: View pending payouts, manually trigger payout, adjust individual ride earnings.
- **SOS monitor**: Dedicated tab showing all emergency alerts with countdown timer since alert.
- **Audit log**: Every admin action is logged. Immutable, timestamped, attributed to admin user ID.
- **Pricing overrides**: Admin can set per-ride surge multiplier, change fare structure, or issue refunds.

---

## 4. Service Level Agreements (SLAs)

| Issue Type | Response Time | Resolution Target | Channel |
|-----------|---------------|-------------------|---------|
| Rider SOS / emergency | Immediate (push notification + audible alert to admin dashboard) | < 5 minutes | In-app SOS, admin dashboard alert |
| Payment failure | < 1 hour | < 4 hours | In-app dispute form, WhatsApp |
| Driver account issue | < 2 hours | < 8 hours | Driver help center, admin review |
| Rider account issue | < 4 hours | < 24 hours | In-app contact form |
| Lost item | < 4 hours | < 24 hours | In-app FAQ (Tier 1), contact form (Tier 2) |
| Technical bug / crash | < 30 minutes (automated alert via health check) | < 24 hours | Automated monitoring, lead engineer paged |
| Feature request | < 48 hours | Not SLA-bound | In-app feedback form; triaged weekly |
| Data subject request (POPIA) | < 24 hours (acknowledgement) | < 21 days (by law) | Privacy email, admin dashboard |
| Driver payout issue | < 2 hours | < 8 hours | Earnings dispute form, admin review |
| Safety incident (non-SOS) | < 30 minutes | < 6 hours | In-app report, admin dashboard |

### SLA Enforcement

- All SLA breaches trigger an alert to the founder and lead engineer.
- Weekly SLA compliance report is generated and reviewed during the weekly check-in call.
- If SLA breach rate exceeds 10% in any given week, a process review is scheduled.
- Target: 95%+ SLA compliance for all Critical and High priority issues.

### Escalation Path (if SLA at risk)

1. Admin acknowledges ticket.
2. If not resolved by SLA deadline, admin flags for founder attention.
3. If resolution target also missed, founder intervenes directly.
4. Post-mortem written for any missed resolution target on Critical issues.
