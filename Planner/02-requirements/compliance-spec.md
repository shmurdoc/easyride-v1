# Compliance Specification

**Phase:** 02 — Requirements  
**Document:** Compliance Specification  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## 1. Overview

EasyRyde operates in South Africa and must comply with multiple regulatory frameworks. This document defines the specific compliance requirements, implementation approach, and verification criteria for each applicable regulation.

### 1.1 Applicable Regulations

| Regulation | Scope | Effective Date | Penalty for Non-Compliance |
|------------|-------|----------------|---------------------------|
| POPIA | Data privacy — all personal information | July 2021 | Fine up to R10M or imprisonment |
| FICA | Financial intelligence — identity verification | Ongoing | Fine up to R100M |
| PCI-DSS | Payment card data security | Ongoing | Fine up to $500K/month + loss of card processing |
| SA Tax Law | VAT, income tax, digital receipts | Ongoing | Interest + penalties up to 200% of tax due |
| SA Labour Law | Driver classification, fair practices | Ongoing | CCMA claims, back-pay, legal costs |

---

## 2. POPIA — Protection of Personal Information Act

### 2.1 Consent Management

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| POPIA-01 | Obtain explicit consent before collecting personal information | Registration flow: checkbox with plain-language explanation of what data is collected and why. Consent recorded with timestamp + version. | ☐ |
| POPIA-02 | Allow consent withdrawal | In-app settings: "Withdraw consent" button. On withdrawal: stop data processing, begin anonymisation schedule (30-day window per POPIA). | ☐ |
| POPIA-03 | Record consent version | Each consent event stored: user_id, consent_version, timestamp, IP. Consent versions documented in compliance repository. | ☐ |
| POPIA-04 | Minors (under 18) require competent person consent | Registration: age gate. If <18, require guardian consent form. Rejection if unverified. | ☐ |

### 2.2 Data Subject Rights

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| POPIA-05 | Right to access — data subject can request all personal data held | `GET /api/v1/account/data-export` endpoint. Returns JSON with all PII: profile, ride history, payment history, communications. 72-hour SLA. | ☐ |
| POPIA-06 | Right to rectification — correct inaccurate data | Profile edit: name, email, phone. Ride history correction via support ticket. | ☐ |
| POPIA-07 | Right to erasure (right to be forgotten) | Self-service account deletion. Financial records anonymised (retained for legal purposes). Non-financial data purged within 30 days. Verification: re-authenticate before deletion. | ☐ |
| POPIA-08 | Right to data portability | Export endpoint returns machine-readable JSON. Includes all user-generated data. Excludes anonymised/aggregated data. | ☐ |
| POPIA-09 | Right to object to processing | Opt-out of marketing communications. Opt-out of data sharing for analytics. Record objection with timestamp. | ☐ |

### 2.3 Data Retention Schedules

| Data Category | Retention Period | Rationale | Action After Period |
|---------------|-----------------|-----------|---------------------|
| Rider profile | 5 years after last activity | POPIA + business need | Anonymise or delete |
| Driver profile | 5 years after last activity | FICA (5-year requirement) | Anonymise financial records, purge rest |
| Ride records | 5 years | Tax records + dispute resolution | Anonymise PII, retain aggregate |
| Payment transactions | 7 years | SARS tax requirement | Retain (no PII — tokenised) |
| Chat messages | 1 year | Dispute resolution | Delete |
| GPS location data | 90 days | Operational need | Anonymise to aggregate heatmaps |
| Driver documents | 5 years after driver account closure | FICA requirement | Securely delete |
| Audit logs | 5 years | POPIA + business need | Archive to cold storage |
| Session tokens | Expiry + 30 days | Security | Delete |
| Marketing preferences | Until consent withdrawn or 5 years inactive | POPIA | Delete |

### 2.4 Data Protection Measures

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| POPIA-10 | PII encrypted at rest | AES-256 column-level encryption for: name, email, phone, ID number. Application-layer encryption with key rotation. | ☐ |
| POPIA-11 | PII encrypted in transit | TLS 1.3 on all external endpoints. Internal service communication via mTLS or VPN. | ☐ |
| POPIA-12 | Access control — minimum necessary access | Role-based access: Support sees limited PII (name, phone — no ID number). Finance sees payment data. Admin sees full profile. | ☐ |
| POPIA-13 | Access logging | Every access to PII logged: who, what, when, why. Logs immutable (append-only). | ☐ |
| POPIA-14 | Pseudonymisation where possible | UUIDs used as primary identifiers in APIs. Username/internal IDs never exposed in URLs. | ☐ |

### 2.5 Breach Notification

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| POPIA-15 | Data breach detection | Sentry alerting + intrusion detection. Any unusual data access pattern triggers investigation. | ☐ |
| POPIA-16 | Breach notification to Regulator | Within 72 hours of becoming aware. Template: nature of breach, categories of data, number of affected subjects, remediation steps. | ☐ |
| POPIA-17 | Breach notification to affected subjects | If reasonable grounds to believe data subject suffered or could suffer harm. Direct notification via email + SMS. | ☐ |
| POPIA-18 | Breach documentation | Record: date discovered, nature, affected data, root cause, remediation, notification logs. Maintained for 5 years. | ☐ |

### 2.6 Information Officer

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| POPIA-19 | Designate Information Officer | Register with SA Information Regulator. Name and contact published on privacy policy page. | ☐ |
| POPIA-20 | Information Officer responsibilities | Monitor POPIA compliance, conduct internal assessments, handle data subject requests, act as contact for Regulator. | ☐ |

---

## 3. FICA — Financial Intelligence Centre Act

### 3.1 Identity Verification — Drivers

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| FICA-01 | Verify identity of all drivers collecting payments | Collect: SA ID book/card (both sides) or passport (foreign drivers). Verify against Home Affairs database (via third-party service). | ☐ |
| FICA-02 | Proof of address | Utility bill or bank statement dated within last 3 months. Residential address matching ID. | ☐ |
| FICA-03 | Face verification | Live selfie compared to ID photo. Automated liveness detection. Manual admin review if match <80%. | ☐ |
| FICA-04 | Beneficial ownership | If driver account is operated on behalf of another person or entity: collect beneficial owner details (same identity verification). | ☐ |
| FICA-05 | Risk rating | Each driver assigned risk rating (low/medium/high) based on: ride volume, payment patterns, disputes. Enhanced due diligence for high-risk. | ☐ |

### 3.2 Document Retention

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| FICA-06 | Retain FICA documents for 5 years | After driver account closure: retain copies of ID, proof of address, verification records for 5 years. Secure encrypted storage. | ☐ |
| FICA-07 | Document expiry monitoring | Driver's license: track expiry, send reminder 30 days before, deactivate if expired >7 days. | ☐ |
| FICA-08 | Periodic re-verification | Every 12 months: re-verify ID, proof of address, face match. Trigger early if risk profile changes. | ☐ |

### 3.3 Transaction Monitoring

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| FICA-09 | Reportable transactions | Monitor for cash transactions > R24,999.99. Report to FIC (Financial Intelligence Centre) within 2 business days. | ☐ |
| FICA-10 | Suspicious transaction reporting | Flag patterns: rapid ride churn (multiple short rides), payment method cycling, refund abuse. Report suspicious activity to FIC. | ☐ |
| FICA-11 | Record keeping | All transaction records retained for 5 years (same as POPIA overlap). Records must be reconstructable per request. | ☐ |

### 3.4 Admin Workflow

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| FICA-12 | Driver FICA checklist | Admin sees per-driver FICA status: documents received, verified, risk rating, next review date. Traffic-light indicator. |
| FICA-13 | FICA deficiency tracking | If documents missing or expired: driver flagged, cannot accept rides until resolved. Admin notification. |
| FICA-14 | FICA compliance report | Exportable report: all drivers with FICA status, document expiry dates, last verification date, risk rating. |

---

## 4. PCI-DSS — Payment Card Industry Data Security Standard

### 4.1 Cardholder Data Protection

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| PCI-01 | Never store full PAN (Primary Account Number) | All card data handled by Stripe Elements. Our servers never see or store raw PAN. Only Stripe token or customer ID stored. | ☐ |
| PCI-02 | Tokenisation | Use Stripe Tokens or SetupIntents. Token can be used for charges but cannot be reversed to PAN. | ☐ |
| PCI-03 | Card data transmission | All card data transmitted over TLS 1.3. Stripe handles the PCI-DSS scope — we inherit via SAQ A. | ☐ |
| PCI-04 | Mask PAN in storage | If any card identifier stored: show only last 4 digits. Example: `************4242`. | ☐ |
| PCI-05 | 3D Secure | Enable Stripe Radar + 3D Secure for card-not-present transactions. Fallback to non-3DS only for low-risk amounts (<R200). | ☐ |

### 4.2 Access Control

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| PCI-06 | Need-to-know access | Only finance admin role can view payment details (last 4 digits, token). Developers: never. Support: masked view only. | ☐ |
| PCI-07 | Unique user IDs | Every admin account is unique. No shared accounts. | ☐ |
| PCI-08 | Physical security | Production servers: encrypted disks, access logged. Stripe Dashboard: restricted to 2 named finance staff. | ☐ |

### 4.3 Network Security

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| PCI-09 | Firewall | Cloud firewall rules: restrict inbound to HTTP/HTTPS only. Admin access via VPN + bastion host. | ☐ |
| PCI-10 | Encryption in transit | TLS 1.3 on all external-facing services. Internal services: mTLS or private network. | ☐ |
| PCI-11 | Vulnerability scanning | Weekly external vulnerability scan (Qualys or similar). Quarterly ASV scan if processing >300K card transactions/year. | ☐ |

### 4.4 Monitoring & Testing

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| PCI-12 | Intrusion detection | Log monitoring for: repeated login failures, unusual access patterns, large data exports. Alerting on anomaly. | ☐ |
| PCI-13 | Security incident response | Documented incident response plan. Tested quarterly. Includes: containment, eradication, recovery, notification. | ☐ |
| PCI-14 | Penetration testing | Annual penetration test (external firm). After any significant infrastructure change. | ☐ |
| PCI-15 | Log retention | All access logs retained for minimum 12 months. PCI audit logs: 3 months immediately accessible, 12 months archived. | ☐ |

### 4.5 SAQ A Self-Assessment

| ID | Requirement | Status |
|----|-------------|--------|
| PCI-16 | Confirm card data is tokenised (never stored by EasyRyde) | ☐ |
| PCI-17 | Confirm no PAN stored in electronic or paper format | ☐ |
| PCI-18 | Confirm card data processed only by PCI-compliant third parties (Stripe) | ☐ |
| PCI-19 | Confirm all external connections use TLS 1.2+ | ☐ |
| PCI-20 | SAQ A form completed and signed annually | ☐ |

---

## 5. SA Tax Law Compliance

### 5.1 VAT (Value-Added Tax)

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| TAX-01 | VAT registration | EasyRyde must register for VAT if annual revenue exceeds R1M. Calculate and remit 15% VAT to SARS. | ☐ |
| TAX-02 | VAT on platform fee | Platform fee (20% of ride fare) is the taxable supply. VAT = (platform fee × 15/115). Output VAT on each transaction. | ☐ |
| TAX-03 | VAT on delivery fee | Food delivery fee: standard-rated 15% VAT. Output VAT on each delivery. | ☐ |
| TAX-04 | Input VAT recovery | Claim input VAT on: cloud infrastructure, marketing, professional services, vehicle expenses for company-owned vehicles. | ☐ |
| TAX-05 | VAT invoices | Provide tax invoice for all platform fees (R50+). Include: EasyRyde VAT number, date, amount, VAT amount, total. | ☐ |

### 5.2 Digital Receipts

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| TAX-06 | Receipt for every transaction | Every ride and delivery generates a receipt. PDF + email + in-app. Includes: EasyRyde details, date, amount, VAT breakdown. | ☐ |
| TAX-07 | Receipt retention | Receipts retained for 7 years (SARS requirement). Accessible by user through account history. | ☐ |
| TAX-08 | Driver income record | Driver earnings statement generated weekly. Shows: gross earnings, platform fees, net pay. Driver responsible for personal income tax. | ☐ |

### 5.3 Driver Tax Compliance

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| TAX-09 | Driver classification | Drivers are independent contractors (not employees). Confirmed in terms of service. No PAYE deducted. | ☐ |
| TAX-10 | Driver tax guidance | In-app information: "You are responsible for declaring earnings to SARS. Provisional tax may apply if annual earnings > R20,000." | ☐ |
| TAX-11 | Annual earnings report | By 31 May each year: provide each driver with annual earnings statement for tax filing. | ☐ |

---

## 6. SA Labour Law

### 6.1 Driver Classification

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| LAB-01 | Independent contractor status | Written terms of service confirming: driver sets own hours, uses own vehicle, no exclusivity, no guaranteed earnings. | ☐ |
| LAB-02 | No employer obligations | No PAYE, UIF, SDL, or pension contributions. No annual or sick leave. No company-provided equipment. | ☐ |
| LAB-03 | Control test compliance | Platform does not control: when driver works (online/offline choice), what routes they take, what other work they do. Platform controls: safety standards, quality standards, payment processing. This balance maintains contractor status. | ☐ |
| LAB-04 | Legal review | Contractor classification reviewed by SA labour lawyer annually. Updated based on case law (Uber SA rulings, etc.). | ☐ |

### 6.2 Fair Practices

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| LAB-05 | Fair cancellation policy | Both rider and driver can cancel with reasonable notice. No penalty for circumstances outside driver's control. | ☐ |
| LAB-06 | Transparent earnings | Driver sees full fare breakdown per ride. No hidden deductions. Platform fee clearly displayed. | ☐ |
| LAB-07 | Dispute resolution | Formal dispute resolution process: driver/rider submits dispute → admin reviews within 24h → written decision → appeal option. | ☐ |
| LAB-08 | Non-discrimination | Dispatch algorithm is neutral (proximity + rating). No discrimination based on race, gender, location. Audited quarterly. | ☐ |
| LAB-09 | Deactivation policy | Written policy: reasons for deactivation (safety, fraud, repeated cancellation, rating below threshold). 7-day notice before deactivation (except immediate safety suspension). Appeal process. | ☐ |

### 6.3 Health & Safety

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| LAB-10 | Driver safety | SOS button for drivers too. Safety tips in onboarding. Insurance information provided. | ☐ |
| LAB-11 | Working hours notification | App notifies driver after 12 hours continuous online time: "You've been online for 12 hours. Consider taking a break." Auto-offline after 14 hours (with override for safety). | ☐ |

---

## 7. Compliance Verification Matrix

| ID | Requirement | Test Method | Frequency | Owner |
|----|-------------|-------------|-----------|-------|
| POPIA-01–04 | Consent management | Manual audit + automated check of consent records | Quarterly | PM |
| POPIA-05–09 | Data subject rights | Automated test of data export/deletion endpoints + manual process review | Per sprint + annually | Tech Lead |
| POPIA-10–14 | Data protection | Automated encryption check + manual access control audit | Monthly | Tech Lead |
| POPIA-15–18 | Breach notification | Tabletop exercise + documented playbook test | Quarterly | Info Officer |
| FICA-01–05 | Driver verification | Automated doc validation + manual admin review audit | Per driver + monthly audit | Admin team |
| FICA-09–11 | Transaction monitoring | Automated flagging + manual review of flagged transactions | Daily (auto) + weekly (review) | Finance Admin |
| PCI-01–05 | Card data protection | SAQ A self-assessment + quarterly scan | Annually + quarterly | Tech Lead |
| PCI-12–15 | Security monitoring | Incident response drill + vulnerability scan | Quarterly + weekly | Tech Lead |
| TAX-01–05 | VAT compliance | Automated VAT calculation tests + quarterly review | Per transaction (auto) + quarterly (review) | Finance Admin |
| LAB-01–04 | Contractor classification | Legal review + documentation audit | Annually | Legal counsel |

---

## 8. Compliance Roadmap

| Phase | Compliance Tasks | Target Completion |
|-------|-----------------|------------------|
| **Pre-launch** | Register as POPIA Information Officer, draft privacy policy, register for VAT, complete SAQ A, engage labour lawyer for contractor review | Launch - 30 days |
| **Launch** | Consent flow live, data export/deletion endpoints live, FICA verification operational, receipt generation live | Launch day |
| **Month 1** | First FICA re-verification cycle, first transaction monitoring review, privacy policy published, breach notification playbook tested | M1 |
| **Quarter 1** | First quarterly POPIA audit, first vulnerability scan, first incident response drill | Q1 |
| **Annual** | SAQ A renewal, labour law review, penetration test, Data Protection Impact Assessment (DPIA) | Annually |

---

## 9. Privacy Policy Structure

The following sections must be included in the EasyRyde privacy policy (POPIA-compliant):

1. **Who we are** — EasyRyde (Pty) Ltd, contact details, Information Officer
2. **What personal information we collect** — categories of data collected
3. **How we collect it** — direct, automatic, third-party sources
4. **Purpose of processing** — why each category is collected
5. **Legal basis** — consent, contractual necessity, legal obligation, legitimate interest
6. **Who we share it with** — payment processors, cloud providers, regulators (as required)
7. **International transfers** — if data leaves SA (Stripe US, AWS) — adequacy safeguards
8. **Data retention** — how long each category is kept
9. **Your rights** — access, rectification, erasure, restriction, portability, objection
10. **How to exercise rights** — in-app settings, email to Information Officer
11. **Complaints** — how to complain to the Information Regulator
12. **Changes to this policy** — version history, notification of material changes
13. **Effective date**

---

## 10. Compliance Contacts

| Role | Responsible Party | Contact |
|------|------------------|---------|
| POPIA Information Officer | TBD | info@easyryde.co.za |
| FICA Compliance Officer | TBD | fica@easyryde.co.za |
| PCI-DSS Security Officer | TBD | security@easyryde.co.za |
| Tax Advisor | TBD | tax@easyryde.co.za |
| Labour Law Counsel | TBD | legal@easyryde.co.za |
| SA Information Regulator | N/A | inforeg@justice.gov.za / 012 406 4818 |
