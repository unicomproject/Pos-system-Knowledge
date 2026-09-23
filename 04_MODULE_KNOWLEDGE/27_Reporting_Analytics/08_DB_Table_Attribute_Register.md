# 08 DB Table Attribute Register

| Schema | Table | Column | DB Type | Nullable | Default | PK | FK | Unique | Index | Entity Property | Meaning | Report |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| public | Orders | Id | uuid | false | null | true | false | true | true | Id | Order PK | All |
| public | Orders | TenantId | uuid | false | null | false | true | false | true | TenantId | Tenant Isolation | All |
| public | Orders | Status | int | false | null | false | false | false | false | Status | Order lifecycle | RPT-01, 04 |
| public | Payments | Id | uuid | false | null | true | false | true | true | Id | Payment PK | RPT-02 |
| public | Payments | Amount | decimal | false | null | false | false | false | false | Amount | Paid amount | RPT-02 |

*Note: Table structure verified from EF models. Deep property exhaustive list marked as IMPLEMENTATION GAP due to missing strict schema.*
