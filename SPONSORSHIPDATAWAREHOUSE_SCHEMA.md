SPONSORSHIPDATAWAREHOUSE_SCHEMA.md
A warehouse‑grade schema for analytics, dashboards, and forecasting.

`markdown

Sponsorship Data Warehouse Schema

A structured, analytics‑ready schema for supporter data.

---

🧱 Tables

supporters
- id (string, PK)  
- name (string)  
- tier (string)  
- joined_at (datetime)  
- link (string)  
- avatar_url (string)  
- message (string)  

tiers
- tier_id (string, PK)  
- name (string)  
- monthly_amount (number)  
- benefits (array)  

engagement
- id (string, PK)  
- supporter_id (string, FK)  
- event_type (string)  
- timestamp (datetime)  
- metadata (json)  

revenue
- id (string, PK)  
- supporter_id (string, FK)  
- amount (number)  
- date (datetime)  
- tier (string)  

---

🧩 Views

vtierdistribution
Aggregates supporters by tier.

vmonthlyrevenue
MRR by month.

vengagementheatmap
Engagement events by day/time.

---

📊 Use Cases
- dashboards  
- forecasting  
- churn analysis  
- tier optimization  
`