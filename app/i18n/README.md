# Translation Style Guide

This project uses **flat JSON translation files** (one per language) managed via **Tolgee / Weblate**.

Please follow these rules when **adding or modifying translation keys**.

---

## 1. Translation keys

### ✅ Rules

- Keys must be **lowercase**
- Use **dot-separated namespaces**
- Keys must be **stable identifiers**, not English text
- Do **not** include spaces, punctuation, or casing rules
- Keys should describe **where the text is used**, not what it says

**Allowed characters:** `a–z`, `0–9`, `.`, `_`

### ✅ Good

```json
"workout.finish.button": "Finish workout"
"ai.planner.subtitle": "Use AI to generate an entire program suited to your goals"
```

### ❌ Bad

```json
"Finish workout?": "Finish workout?"
"AiPlannerSubtitle": "Use AI to generate an entire program suited to your goals"
"All kilograms": "All kilograms"
```

---

## 2. Key structure & naming

Use the following general structure:

```
<domain>.<feature>.<element>.<role>
```

Not all parts are required, but **order matters**.

### Examples

```json
"setup.welcome.get_started": "Get started"
"setup.welcome.opensource.title": "Open Source"
"workout.finish.confirm.body": "You have not filled out all exercises."
```

Prefer **clear, descriptive keys** over short or generic ones.

---

## 3. Context-specific suffixes (important)

Do **not** reuse the same key across different UI contexts just because the English text matches.

Use suffixes to define intent and casing rules:

| Suffix         | Usage                             |
| -------------- | --------------------------------- |
| `.button`      | Buttons                           |
| `.title`       | Screen / dialog titles            |
| `.subtitle`    | Supporting text                   |
| `.label`       | Form labels                       |
| `.body`        | Paragraph or long-form text       |
| `.explanation` | System or permission explanations |

### ✅ Good

```json
"workout.finish.button": "Finish workout"
"workout.finish.confirm.title": "Finish workout?"
"workout.finish.confirm.body": "You have not filled out all exercises. Are you sure you'd like to finish?"
```

### ❌ Bad

```json
"finish": "Finish"
"Finish workout": "Finish workout"
```

---

## 4. Casing & punctuation (values only)

Casing and punctuation are defined by **context**, not the key name.

### Rules

- **Buttons & labels**
  - Sentence case
  - No punctuation

- **Titles**
  - Sentence case
  - Punctuation allowed

- **Body text**
  - Full grammar and punctuation

### ✅ Good

```json
"setup.welcome.get_started": "Get started"
"workout.finish.confirm.title": "Finish workout?"
```

### ❌ Bad

```json
"setup.welcome.get_started": "Get Started"
"workout.finish.confirm.title": "Finish Workout"
```

---

## 5. Interpolation

Use **named placeholders only**.

### ✅ Good

```json
"feed.follow_back": "Follow {user} back"
```

Usage:

```ts
t('feed.follow_back', { user: username });
```

### ❌ Bad

```json
"FollowUserBack{User}": "Follow {0} back"
```

---

## 6. Numbers, units, and filters

Group related labels consistently.

### Units

```json
"units.kilograms.all": "All kilograms"
"units.pounds.all": "All pounds"
```

### Filters

```json
"workouts.all": "All workouts"
"time.all": "All time"
```

Avoid translating numbers unless they are explicitly written-out labels.

---

## 7. General guidelines

- Do **not** embed English wording in keys
- Do **not** delete existing keys without checking usage
- Prefer **clarity over brevity**
- Assume translators do **not** see the UI — context matters
- When in doubt, create a **new, context-specific key**

---

## Summary

**Keys**

- lowercase
- dot-separated
- descriptive
- stable

**Values**

- proper grammar
- context-appropriate casing
- punctuation only where appropriate

If you’re unsure, **add a new key rather than reusing an existing one**.
