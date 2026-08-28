# OO-04b Responsive Test Matrix

Validate this prototype at these minimum viewport widths before using it as implementation reference:

| Device class | Suggested viewport | Expected layout |
|---|---:|---|
| Large desktop | 1600 × 1000 | Full two-column |
| Desktop | 1280 × 800 | Two-column, compact |
| Tablet landscape | 1024 × 768 | Two-column screen, stacked inner primary panels |
| Tablet portrait | 800 × 1280 | Single main column, adaptive sidebar |
| Phone | 390 × 844 | Single-column cards |
| Small phone | 360 × 800 | Single-column, quantity sections one-per-row |

## Required checks

- No horizontal page overflow
- Header/footer remain reachable
- Long order IDs wrap safely
- Long customer/store names do not clip
- Product image scales inside its card
- Scanner controls remain reachable
- Mark as Picked remains usable
- Permission-denied states do not break shell
- QA panel itself remains scrollable on phone
