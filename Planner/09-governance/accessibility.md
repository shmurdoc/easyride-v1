# Accessibility Strategy

## 1. Web Admin Dashboard — WCAG 2.1 Level AA

### 1.1 Compliance Target

All admin dashboard features must meet WCAG 2.1 Level AA criteria by launch (Week 10). Level AAA will not be pursued initially but should not be regressed where easily achievable.

### 1.2 Color Contrast

| Requirement | Standard | Verification Method |
|-------------|----------|---------------------|
| Normal text (< 18pt) | Minimum 4.5:1 contrast ratio | Automated: axe-core in CI. Manual: WebAIM Contrast Checker for all brand colours. |
| Large text (≥ 18pt or ≥ 14pt bold) | Minimum 3:1 contrast ratio | Same as above. |
| UI components and graphical objects | Minimum 3:1 contrast ratio | Check borders, icons, input outlines. |
| Focus indicators | Minimum 3:1 contrast against adjacent colour | Keyboard nav audit. |

**Brand colour compliance**:

| Colour | Hex | Usage | White Text (4.5:1) | Black Text (4.5:1) |
|--------|-----|-------|--------------------|--------------------|
| Primary | #0066CC | Buttons, links | Pass (5.1:1) | N/A |
| Success | #28A745 | Status indicators | Pass (4.7:1) | N/A |
| Warning | #FFC107 | Alert banners | Fail (1.2:1 on white) | Pass (10.3:1 on black) |
| Danger | #DC3545 | Errors, SOS | Pass (4.9:1) | N/A |
| SOS Button | #FF0000 | Emergency | Pass (5.1:1 on white bg) | N/A |

**Remediation for warning color**: Warning banners will use a dark background (`#856404`) with yellow text or ensure yellow text has a dark background behind it. Never pure yellow on white.

### 1.3 Keyboard Navigation

| Requirement | Implementation |
|-------------|----------------|
| All interactive elements focusable | Every button, link, input, select, dropdown is reachable via Tab. |
| Visible focus indicator | `:focus-visible` styles with 2px solid outline in a contrasting colour. |
| Logical tab order | Left-to-right, top-to-bottom. Navigation sidebar first, then main content. |
| No keyboard traps | Focus can always be moved away from any element using Tab/Shift+Tab. |
| Skip navigation link | "Skip to main content" link visible on first Tab press. |
| Action shortcuts | Common actions (search, create ticket, approve driver) mapped to keyboard shortcuts. Documented in help menu. |

**Keyboard shortcut cheat sheet** (printed and on dashboard help):

| Shortcut | Action |
|----------|--------|
| `Ctrl + /` | Open global search |
| `Ctrl + N` | Create new ticket |
| `Ctrl + Enter` | Submit current form |
| `Esc` | Close modal / cancel |
| `?` | Toggle shortcut help overlay |

### 1.4 Screen Reader Support

| Requirement | Implementation |
|-------------|----------------|
| Semantic HTML | Use `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`, `<form>`, `<table>`, `<button>`. No `div`-based buttons. |
| ARIA labels | All icon-only buttons have `aria-label`. Dynamic content regions use `aria-live="polite"`. |
| Status messages | Toast notifications use `role="status"` and `aria-live="polite"`. Error messages use `role="alert"`. |
| Modals | `role="dialog"`, `aria-modal="true"`, focus trapped inside modal, focus returns to trigger on close. |
| Tables | Use `<caption>`, `<th scope="col">` / `scope="row"`, `aria-sort` on sortable columns. |
| Images | All meaningful images have `alt` text. Decorative images have `alt=""`. |

### 1.5 Text Scaling

| Requirement | Implementation |
|-------------|----------------|
| 200% zoom no breakage | Layout uses relative units (`rem`, `em`, `%`). No fixed-width containers that cause horizontal scroll at 200%. |
| Text not clipped | All containers have `overflow: visible` or `min-height` that accommodates larger text. |
| Reflow | No horizontal scrolling required at 200% zoom (viewport width exception for wide data tables). |
| No loss of functionality | All interactive elements remain usable at 200% zoom. Confirmed via manual testing. |

---

## 2. Mobile Apps — Accessibility

### 2.1 Touch Targets

| Requirement | Standard | Verification |
|-------------|----------|--------------|
| Minimum tap target | 44×44pt (iOS HIG) / 48×48dp (Material Design) | Audit with Accessibility Inspector. |
| Spacing between targets | ≥ 8pt to prevent mis-taps | Visual audit + automated layout checks. |
| SOS button | Minimum 60×60pt | Fixed size, not affected by responsive layout. |
| Interactive list items | Entire row tappable, not just text | Test with target size checker. |

### 2.2 Text and Scaling

| Requirement | Implementation |
|-------------|----------------|
| Dynamic type | All text uses system font scaling (preferredContentSizeCategory on iOS, fontScale on Android). |
| Minimum font size | 14pt for body text. 12pt minimum for labels and secondary text. |
| Line height | Minimum 1.5× font size for body text. |
| Truncation tests | All text labels tested with longest possible content (e.g., "R1,234,567.89" for fare display). |

### 2.3 Colour and Themes

- **Light theme**: Default. High contrast by default. Dark text on light background throughout.
- **Dark theme**: Uses system setting. Checked for all contrast ratios independently.
- **Grayscale test**: All screens checked in grayscale mode to ensure information is not conveyed by colour alone (e.g., ride status icons must have text labels, not just green/red dots).
- **Deuteranopia (colour blindness) test**: Red-green differentiation never used as the sole differentiator. Status indicators use icons + text + colour.

### 2.4 Screen Reader Support

| Component | Requirements |
|-----------|--------------|
| Buttons | `accessibilityLabel` describing the action ("Cancel ride", "Call driver"). |
| Images | `accessibilityLabel` on meaningful images. `accessibilityElementsHidden` on decorative. |
| Ride status | `accessibilityLiveRegion="polite"` for status changes. |
| Map | `accessibilityLabel` on map container. Map markers have labels. |
| Forms | Each input labelled with `accessibilityLabel` or native `<Label>`. Error messages announced automatically. |
| Alerts | System `Alert.alert` used (native, screen-reader friendly). Custom modals use `accessibilityViewIsModal`. |

---

## 3. Language and Internationalization

### 3.1 Second Language Support

| Language | Locale Code | Priority | Target |
|----------|-------------|----------|--------|
| English | `en` | Primary | Launch-ready |
| Afrikaans | `af` | High | v1.2 |
| Xitsonga (Tsonga) | `ts` | Medium | v1.2 |
| Sesotho sa Leboa (Northern Sotho) | `nso` | Medium | v1.2 |

**Implementation approach**:
- Existing `en.ts` i18n framework extended with locale files for each language.
- Language selection in app Settings → Language (or follows system locale).
- Voice prompts (turn-by-turn navigation, ride status announcements) in selected language where available.

### 3.2 Plain Language

All user-facing text must:

- Use short sentences (< 20 words where possible).
- Avoid jargon ("fare" → "ride price", "ETA" → "arrival time").
- Use active voice ("You cancelled your ride" not "Your ride has been cancelled").
- Be translatable (no idioms, no cultural references, no puns).
- Use consistent terminology across the app.

---

## 4. Emergency Features — Accessibility

### 4.1 SOS Button

| Requirement | Implementation |
|-------------|----------------|
| Highly visible | Red (#FF0000) background. White text/icon. Minimum 60×60pt. Positioned at bottom of screen (thumb zone). |
| Screen reader | `accessibilityLabel="Emergency — contact admin"` with `accessibilityHint="Double tap to send your location to the EasyRyde admin team"`. |
| Confirmation | After tapping, a confirmation dialog appears before sending. `accessibilityLabel` on dialog: "Send emergency alert to admin?". |
| Plain language | Label reads "SOS — Help" instead of "Emergency Assistance Request". |
| No accidental trigger | Long-press required (minimum 1 second) or tap + confirm dialog. Configurable to avoid false alarms. |

### 4.2 Trusted Contact Sharing

- Trip sharing feature: Send live location link via WhatsApp.
- `accessibilityLabel` on share button: "Share your trip with a friend".
- No minimum character limits on contact entry.
- Contact entry uses system contacts picker (accessible by default).

---

## 5. Testing and Compliance

### 5.1 Automated Testing (CI Pipeline)

| Tool | What It Checks | Frequency |
|------|----------------|-----------|
| axe-core (web) | WCAG 2.1 AA violations on all admin dashboard pages | Every PR |
| React Native Accessibility API | `accessibilityLabel` presence, touch target size | Every PR |
| Colour contrast checker | All colour combinations against 4.5:1 / 3:1 standards | Every PR |

### 5.2 Manual Testing

| Test | Frequency | Tester |
|------|-----------|--------|
| Keyboard-only navigation (web) | Every release | Developer |
| Screen reader walkthrough (VoiceOver iOS / TalkBack Android) | Every release | Developer |
| 200% zoom test (web) | Every release | Developer |
| Dynamic type test (iOS) | Every release | Developer |
| Font scale test (Android) | Every release | Developer |
| Grayscale mode test (iOS + Android) | Every release | Developer |
| Colour blindness test (simulator) | Every major release | Developer |
| Real-world test with assistive tech user | Every major release | External tester (budgeted) |

### 5.3 Accessibility Statement

An accessibility statement will be published at `/accessibility` on the admin dashboard domain. Content:

- Commitment to accessibility.
- Current compliance level (WCAG 2.1 AA — in progress / achieved).
- Known limitations (if any).
- Contact details for accessibility-related issues.
- Date of last accessibility review.
