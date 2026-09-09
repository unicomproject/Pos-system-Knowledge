# OO-05 Responsive Test Matrix

| Device class | Suggested viewport | Expected layout |
|---|---:|---|
| Large Desktop | 1600 × 1000 | Full two-column |
| Desktop | 1280 × 800 | Two-column compact |
| Tablet Landscape | 1024 × 768 | Two-column compact |
| Tablet Portrait | 800 × 1280 | Single main column |
| Phone | 390 × 844 | Fully stacked |
| Small Phone | 360 × 800 | Compact stacked |

## Mandatory checks

- No page-level horizontal overflow
- Header and bottom navigation remain reachable
- Long order/customer/store/product values wrap safely
- Picked item badge remains visible
- Packing notes remain editable and character count reachable
- Mark Ready CTA remains reachable
- Permission-denied and entitlement-denied states preserve the shell
- QA panel remains scrollable on phone
- Incomplete-picking state disables Mark Ready
- Command failure keeps user on the screen
