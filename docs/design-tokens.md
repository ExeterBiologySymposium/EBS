# EBS design tokens

Source Sans 3 throughout; system-ui, sans-serif fallback. One humanist family supports headings and long educational content without importing a second visual identity. Self-host production font with font-display: swap where available; fallback remains usable.

| Token | Light | Dark |
|---|---|---|
| Background | #FFFFFF | #151719 |
| Surface | #F4F5F5 | #202326 |
| Text | #17191B | #F3F4F4 |
| Secondary text | #54595E | #B8BDC2 |
| Primary/link | #9D2235 | #EEA4AE |
| Primary hover | #7F192A | #F5BCC4 |
| On primary | #FFFFFF | #151719 |
| Border | #D9DDDF | #474D52 |
| Focus | #9D2235 | #EEA4AE |

Body/link text must achieve WCAG AA 4.5:1 on its actual background. Border token only divides content; interactive input borders use secondary-text token for contrast. Form error uses primary with explicit text, never color alone.

| Role | Desktop | Below 768px | Weight / line height |
|---|---|---|---|
| H1 | 48px | 32px | 600 / 1.1 |
| H2 | 32px | 28px | 600 / 1.2 |
| H3 | 24px | 22px | 600 / 1.25 |
| Body | 18px | 18px | 400 / 1.6 |
| Supporting | 14px | 14px | 400 / 1.5 |
| Navigation | 16px | 18px | 600 / 1.5 |

Spacing: 4, 8, 12, 16, 24, 32, 48, 64px. Maximum content width 1200px; reading width 720px. Horizontal page padding 32px desktop, 24px tablet, 16px mobile. Sections 48px desktop, 32px mobile. Header at most 80px. Navigation collapses below 1024px; content columns below 768px. Control radius 4px; imagery 0. Shadows none. Color/opacity feedback 150ms ease; no movement or entrance animation.

## CSS variable contract

```css
:root {
  --bg:#fff; --surface:#f4f5f5; --text:#17191b; --muted:#54595e;
  --primary:#9d2235; --primary-hover:#7f192a; --on-primary:#fff;
  --border:#d9dddf; --focus:var(--primary);
  --font:"Source Sans 3",system-ui,sans-serif;
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-6:24px; --space-8:32px; --space-12:48px; --space-16:64px;
  --page-width:1200px; --reading-width:720px; --radius:4px;
}
[data-theme="dark"] {
  --bg:#151719; --surface:#202326; --text:#f3f4f4; --muted:#b8bdc2;
  --primary:#eea4ae; --primary-hover:#f5bcc4; --on-primary:#151719;
  --border:#474d52;
}
```

## Tailwind mapping (documentation only)

No Tailwind dependency or build step. Equivalent theme mapping for future consumers:

```js
{
  colors: { background:'var(--bg)', surface:'var(--surface)', text:'var(--text)', muted:'var(--muted)', primary:'var(--primary)', 'primary-hover':'var(--primary-hover)', 'on-primary':'var(--on-primary)', border:'var(--border)', focus:'var(--focus)' },
  fontFamily: { sans:['Source Sans 3','system-ui','sans-serif'] },
  spacing:{1:'4px',2:'8px',3:'12px',4:'16px',6:'24px',8:'32px',12:'48px',16:'64px'},
  maxWidth:{page:'1200px',reading:'720px'}, borderRadius:{control:'4px'}, boxShadow:{none:'none'}
}
```
