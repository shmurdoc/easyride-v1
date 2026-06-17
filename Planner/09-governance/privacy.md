# Privacy Policy & Data Governance

## 1. PII Inventory

### 1.1 Collected Data

| Data Field | Table(s) | Purpose | Retention | Sensitivity |
|------------|----------|---------|-----------|-------------|
| Phone number | `users` | Primary identifier, account login, driver/rider contact | Account lifetime | High |
| Email address | `users` | Account recovery, receipts, marketing (with consent) | Account lifetime | Medium |
| Full name | `users` | Display name, receipts, admin reference | Account lifetime | Medium |
| Profile photo | `users` | Display on profile | Account lifetime | Low |
| ID number | `identity_verifications` | FICA compliance (drivers only) | 5 years post-deactivation | Critical |
| Driver's license number | `identity_verifications` | FICA compliance (drivers only) | 5 years post-deactivation | Critical |
| Vehicle registration | `vehicles` | Service eligibility, FICA | 5 years post-deactivation | Medium |
| Current latitude/longitude | `users`, `ride_locations` | Real-time ride tracking | Deleted at ride end | High |
| Location history | `ride_locations` | Dispute resolution, driver earnings verification | 90 days | High |
| Ride history | `rides` | Service delivery, dispute resolution | 5 years (financial) | Medium |
| Payment method token | `users`, `payment_methods` | Payment processing (Stripe token) | Account lifetime | Medium |
| Chat messages | `chat_messages` | Customer support | 30 days | High |
| Device tokens | `user_devices` | Push notifications | Until revoked | Low |
| IP address | `audit_logs`, `consent_records` | Security audit, consent recording | 5 years | Low |
| User agent | `consent_records` | Consent recording | 5 years | Low |
| Rating data | `reviews` | Service quality | Account lifetime | Low |

### 1.2 Data Classification

| Level | Definition | Examples | Requirements |
|-------|------------|----------|--------------|
| Critical | Unauthorized disclosure causes severe harm | ID number, license number | AES-256 at rest, never logged, role-based access only |
| High | Unauthorized disclosure causes moderate harm | Phone, location, chat | Encrypted at rest, access limited to support team |
| Medium | Unauthorized disclosure causes minor harm | Name, email, vehicle reg | Encrypted at rest, accessible to admin team |
| Low | Public or low-sensitivity data | Ratings, profile photo (if user set to public) | Standard access controls |

---

## 2. Data Collection Principles

### 2.1 Data Minimization

EasyRyde collects only what is necessary to operate the service:

- **Location**: Collected only during active rides (from driver accepted through ride completed/cancelled). Location polling stops when ride ends. Background location is not tracked when app is closed.
- **Payment details**: Handled entirely by Stripe Elements. No card data touches EasyRyde infrastructure.
- **Identity documents**: Collected only from drivers (FICA requirement). Riders are not asked for ID.
- **Contacts/phonebook**: Not accessed. Rider enters phone numbers manually for trusted contact sharing.

### 2.2 Purpose Limitation

| Purpose | Data Used | Legal Basis |
|---------|-----------|-------------|
| Service delivery (matching, tracking, payments) | Name, phone, location, ride history, payment token | Contractual necessity |
| Safety (SOS, incident response) | Location, phone, name | Legitimate interest (vital interest in emergency) |
| Customer support | Chat messages, ride history, account details | Contractual necessity |
| Analytics (aggregated, anonymized) | Aggregated ride data (stripped of PII) | Legitimate interest |
| Communication (ride status, receipts) | Phone (SMS/push), email | Contractual necessity |
| Marketing (promotions, referral credits) | Phone, email | Consent (opt-in) |
| Compliance (FICA, tax) | ID number, license, financial records | Legal obligation |

---

## 3. Data Sharing

### 3.1 Third Parties

| Third Party | Data Shared | Purpose | Contractual Safeguards |
|-------------|-------------|---------|----------------------|
| Stripe | Payment method token (not card data), amount, currency | Payment processing | DPA in place. Stripe is PCI-DSS Level 1 compliant. |
| AWS / S3-compatible | Encrypted document uploads | File storage | DPA in place. Data stored in af-south-1 (Cape Town). |
| Twilio (or SMS provider) | Phone number, message body | SMS notifications | DPA in place. Messages retained 30 days. |
| Google Maps / Mapbox | Start/end addresses (not PII) | Map display, route calculation | Anonymized geocoding. No personal data in URL params. |
| Firebase / Expo Push | Device token, push notification payload | Push notifications | DPA in place. Notification payloads not retained. |

### 3.2 Data Sharing During Active Ride

During an active ride, the following is shared between rider and driver:

| Data Shared | With Rider | With Driver |
|-------------|------------|-------------|
| Name | Driver's first name | Rider's first name |
| Phone number | Driver's phone number | Rider's phone number |
| Real-time location | Driver's current location | Rider's pickup location |
| Vehicle details | Make, model, colour, plate number | Not shared (driver already knows their vehicle) |
| Rating | Driver's average rating | Rider's average rating |
| Trip destination | Rider sees their own destination | Driver sees drop-off location |

**After ride ends**: Location tracking stops. Phone number is no longer visible to the other party after 1 hour unless chat is active.

### 3.3 Data Not Shared

EasyRyde does **not** sell, rent, or trade personal data. No data shared with advertisers. No data shared with insurance companies without explicit consent (except as required by law).

---

## 4. User Rights Implementation

### 4.1 Access — `GET /api/v1/data/export`

Returns a JSON file containing all PII associated with the authenticated user:

```json
{
  "user": {
    "full_name": "John Doe",
    "phone_number": "+27712345678",
    "email": "john@example.com",
    "created_at": "2026-01-15T10:00:00Z"
  },
  "rides": [
    {
      "id": 1042,
      "pickup": "Phalaborwa Mall",
      "dropoff": "Phalaborwa CBD",
      "completed_at": "2026-02-01T14:30:00Z",
      "fare": 85.00
    }
  ],
  "payments": [
    {
      "amount": 85.00,
      "status": "completed",
      "created_at": "2026-02-01T14:35:00Z"
    }
  ],
  "consent_records": [
    {
      "purpose": "marketing",
      "granted": true,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

- Response delivered via email as encrypted attachment or available for download for 24 hours.
- Rate-limited to once per 7 days.

### 4.2 Correction — Edit Profile (in-app)

User can edit via app:

- Full name
- Email address
- Phone number (requires OTP verification if changed)
- Profile photo

**Admin-required changes**:

- ID number (driver) — requires re-verification
- License number (driver) — requires re-verification
- Vehicle details — requires re-approval

### 4.3 Erasure — `DELETE /api/v1/data/erasure`

**Processing rules**:

1. **Financial records** (`rides`, `payments`, `payouts`): `user_id` is set to `NULL`. All financial amounts and timestamps preserved. This is required for tax compliance — financial records cannot be deleted.
2. **Account data** (`users` table): Soft-deleted (anonymized — name set to "Deleted User", phone set to null, email set to null).
3. **Location data** (`ride_locations`): Hard-deleted.
4. **Chat messages**: Hard-deleted after 30 days anyway — immediate hard delete on erasure request.
5. **Identity documents** (`identity_verifications`): Set to deleted. Actual file encrypted and retained for 5 years (FICA).
6. **Consent records**: Not deleted (permanent audit trail requirement).

### 4.4 Portability

Same as Access (Section 4.1). JSON format is machine-readable and can be imported into other systems.

### 4.5 Withdraw Consent — `POST /api/v1/data/consent-revoke`

| Purpose | Revocation Effect |
|---------|-------------------|
| Marketing | Stop marketing communications immediately. Existing campaign in flight may still be delivered. |
| Location | Stop location tracking. Ride cannot be completed without location consent — rider must re-enable to book. |
| SMS | Stop SMS notifications. Rider may miss ride status updates. |
| Data analytics | Opt out of individual analytics. Aggregated data may still include anonymized ride data. |

---

## 5. Cookie Policy

### Admin Web Dashboard

EasyRyde admin dashboard uses a minimal set of cookies:

| Cookie | Purpose | Type | Duration |
|--------|---------|------|----------|
| `session` | Session authentication | Essential (session) | Browser session |
| `XSRF-TOKEN` | CSRF protection | Essential | Browser session |
| `remember_web` | "Remember me" functionality | Essential | 5 years (if checked) |

### Mobile Apps

No tracking cookies are used in the mobile apps. The apps use:

- Device token for push notifications (stored in `user_devices` table, not a cookie)
- AsyncStorage for local preferences (theme, language) — not synced to server

### Third-Party Cookies

EasyRyde does not use any third-party tracking cookies, analytics cookies, or advertising cookies.

**Stripe**: Stripe Elements may set browser cookies for fraud detection — these are set by Stripe's iframe and are outside EasyRyde's control. Stripe's cookie policy applies.

---

## 6. Privacy Impact Assessment (PIA) Summary

| Risk Area | Risk Level | Mitigation |
|-----------|------------|------------|
| Location tracking | High | Only during active rides. No background location. Consent required. |
| Identity documents (drivers) | High | Encrypted at rest. Role-based access. 5-year retention limit. |
| Payment data | Critical | Fully outsourced to Stripe. No card data stored. |
| Chat messages | Medium | 30-day retention. Encrypted in transit and at rest. |
| Data breach | High | Encryption at rest. Breach notification procedure. Regular security audits. |
| Consent management | Medium | Granular consent recording. Easy revocation. Audit trail. |
| Data retention compliance | Medium | Automated purge cron jobs. Retention schedule documented. |
| Third-party data sharing | Medium | DPA with all vendors. Data minimization in all integrations. |
