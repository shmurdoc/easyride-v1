# Compliance Framework

## 1. POPIA (Protection of Personal Information Act, 2013)

South Africa's data protection law. EasyRyde compliance measures:

### 1.1 Consent

| Requirement | Implementation |
|-------------|----------------|
| Obtain consent before processing | Rider registration includes explicit consent checkbox for: (a) ride data processing, (b) location tracking during rides, (c) communication. Consent timestamp and version recorded in `consent_records` table. |
| Record consent | `consent_records` table schema: `user_id`, `purpose` (ride_data, location, marketing, sms), `granted` (boolean), `ip_address`, `user_agent`, `created_at`. |
| Withdraw consent | User can toggle consent per purpose in Settings → Privacy. Revocation recorded with timestamp. |
| Withdraw consent (API) | `POST /api/v1/data/consent-revoke { purpose: "marketing" }` immediately stops processing for that purpose. |

### 1.2 Data Subject Rights

| Right | Implementation |
|-------|----------------|
| Access | `GET /api/v1/data/export` — returns a JSON file with all PII across all tables. Response sent via email or downloadable link. |
| Correction | Users can edit profile (name, email, phone) in app. ID number and license number require admin approval to change. |
| Erasure | `DELETE /api/v1/data/erasure` — anonymizes financial records (rides, payments), deletes all other PII (location history, chat messages, device tokens). |
| Portability | Same as Access — JSON format, machine-readable. |
| Object to processing | User can restrict processing via consent revocation (Section 1.1). |

### 1.3 Data Retention

| Data Category | Retention Period | Rationale | Disposal Method |
|---------------|------------------|-----------|-----------------|
| Financial records (rides, payments, invoices) | 5 years after ride completion | SA tax law (Statute of Limitations) | Anonymize — replace user_id with null, keep aggregated amounts |
| Real-time location (current_latitude, current_longitude) | Deleted when ride ends | No longer needed | Hard delete from `ride_locations` after ride completion + 1 day buffer |
| Location history (ride_locations table) | 90 days | Dispute resolution, driver earnings verification | Hard delete after 90 days via cron job |
| Chat messages | 30 days | Customer support | Hard delete after 30 days |
| Identity documents (IDs, licences) | 5 years after driver deactivation | FICA compliance | Encrypted archive, no longer accessible via app |
| Device tokens | Until revoked or 12 months inactive | Push notifications | Pruned by cron monthly |
| Session data | 7 days | Active session management | Redis TTL |
| Consent records | Permanent | Audit trail | Never deleted (legal requirement) |
| Audit logs | 5 years | Security and compliance | Append-only, immutable |

### 1.4 Data Security

| Measure | Implementation |
|---------|----------------|
| Encryption at rest | All PII columns encrypted using PostgreSQL `pgcrypto` AES-256. Key stored in environment variable, rotated quarterly. |
| Encryption in transit | TLS 1.3 required for all API traffic. Internal services also use TLS. |
| Access control | Database user has column-level permissions: support team cannot access `password_hash`, `id_number`, `payment_method`. |
| Breach notification | To SA Information Regulator within 72 hours of discovery. To affected data subjects "as soon as reasonably possible." |
| Data Protection Officer (DPO) | Founder acts as DPO during launch phase. Formal DPO appointed when headcount > 10. |

### 1.5 Breach Response Procedure

1. **Detect**: Automated monitoring alerts on unusual access patterns. Manual report from user or admin.
2. **Contain**: Revoke compromised credentials. Block affected IPs. Isolate affected systems.
3. **Assess**: Identify scope (what data, how many records, root cause).
4. **Notify**: Information Regulator within 72 hours. Affected data subjects directly.
5. **Remediate**: Fix vulnerability. Rotate all keys. Document lessons learned.
6. **Report**: Internal post-mortem within 7 days. Update DR plan if needed.

---

## 2. FICA (Financial Intelligence Centre Act)

South Africa's anti-money laundering and counter-terrorism financing law.

### 2.1 Driver Identity Verification

| Requirement | Implementation |
|-------------|----------------|
| Verify identity before allowing earnings | Driver must submit: (a) SA ID document or passport, (b) valid driver's license, (c) proof of residence. |
| Due diligence | Documents stored encrypted on S3-compatible storage. Admin reviews and approves/rejects within 24 hours. |
| Ongoing monitoring | Re-verification required every 12 months. Suspicious transaction reporting to FIC. |
| Record keeping | All verification records retained for 5 years after driver deactivation. |

### 2.2 Driver Verification Flow

```
Driver uploads document → Document encrypted and stored → 
Admin reviews in dashboard → [Approve / Reject with reason] →
Approval recorded in identity_verifications table →
If rejected: Driver can re-upload with corrected document
```

### 2.3 Cash Threshold Reporting

- Single cash payment (or aggregated related payments) > ZAR 24,999.99 must be reported to FIC.
- EasyRyde is cashless (card + digital wallet), so this threshold is unlikely to apply.
- If cash top-up is introduced in future, automated reporting mechanism must be built.

---

## 3. Tax Compliance

### 3.1 VAT (Value-Added Tax)

| Requirement | Implementation |
|-------------|----------------|
| VAT rate | 15% on platform service fee (not on total ride amount — driver is independent contractor, not employee). |
| VAT registration | EasyRyde must register as VAT vendor when annual turnover exceeds ZAR 1 million. |
| Digital receipts | Every ride generates PDF receipt with: EasyRyde VAT number, ride date, base fare, platform fee, VAT amount, total. |
| VAT filing | Bi-monthly VAT201 submission via SARS eFiling. |

### 3.2 Driver Tax

| Requirement | Implementation |
|-------------|----------------|
| Driver classification | Independent contractor (not employee). No PAYE deducted. |
| Annual earnings report | Generated in April each year for the prior tax year. Sent to each driver. Includes total earnings, number of rides, platform fees paid. |
| Driver tax responsibility | Drivers are responsible for their own tax filing (provisional tax). EasyRyde provides data, not tax advice. |

### 3.3 Corporate Tax

- Annual CIT (Corporate Income Tax) filing.
- Standard 27% rate (2026 rate).
- Deductible expenses: platform development costs, marketing, driver incentives, cloud infrastructure.

---

## 4. PCI-DSS (Payment Card Industry Data Security Standard)

### Compliance Strategy: Offload to Stripe

EasyRyde does **not** store, process, or transmit card data. All payment handling is delegated to Stripe.

| PCI-DSS Requirement | How EasyRyde Meets It |
|---------------------|----------------------|
| Do not store card data | Stripe Elements renders card input as an iframe. Card data never reaches EasyRyde servers. |
| Use tokenization | Stripe returns a `payment_method` token (e.g., `pm_abc123`). Only the token is stored in our database. |
| Use TLS 1.2+ | Stripe API requires TLS. All EasyRyde API calls to Stripe are over TLS. |
| SAQ (Self-Assessment Questionnaire) | EasyRyde qualifies for SAQ A (card-not-present, fully outsourced to PCI-compliant third party). |
| Annual validation | Complete SAQ A annually. Maintain PCI compliance evidence in company records. |

### What We Store

- `payment_method` — Stripe token (opaque, reversible only by Stripe).
- `payment_method_type` — "card" or "wallet" (not the actual card brand or last 4 digits unless needed for receipts).

### What We Never Store

- Card number (PAN)
- Card expiry date
- CVV/CVC
- Cardholder name
- Billing address

---

## 5. Compliance Calendar

| Month | Action | Owner |
|-------|--------|-------|
| January | VAT201 submission (bi-monthly, if registered) | Finance |
| March | Annual POPIA compliance review | DPO / Founder |
| April | Generate driver earnings reports for prior tax year | System (automated) |
| May | PCI SAQ A renewal | Lead engineer |
| June | Annual driver re-verification reminder | System |
| July | VAT201 submission (if applicable) | Finance |
| August | DR test — full restore + failover | Lead engineer |
| September | POPIA breach drill | Founder |
| October | Annual FICA review | Founder |
| November | Tax planning for year-end | Finance |
| December | Annual compliance self-assessment | Founder |

---

## 6. Compliance Incident Log Template

```markdown
# Compliance Incident Report

## Incident ID: CIR-{YYYY}-{NNN}
## Date Reported: YYYY-MM-DD
## Reporter: [Name/System]

### Incident Type
[ ] Data breach
[ ] Consent violation
[ ] Data retention violation
[ ] FICA non-compliance
[ ] Tax filing issue
[ ] PCI-DSS issue
[ ] Other: _______________

### Description
[Detailed description of what happened]

### Root Cause
[What went wrong]

### Affected Data
[What data categories, how many records, which users]

### Containment
[Steps taken to stop the incident]

### Regulatory Notification
[ ] Notified Information Regulator (POPIA): Date
[ ] Notified FIC (FICA): Date
[ ] Notified affected data subjects: Date

### Remediation
[Steps taken to prevent recurrence]

### Status: [Open / In Progress / Closed]
### Closed Date: YYYY-MM-DD
```
