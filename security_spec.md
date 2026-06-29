# Security Specification - ApoCute Pharmacy

This document outlines the security invariants, validation rules, and the "Dirty Dozen" attack vector payloads designed to verify the security of the Firestore database.

## Data Invariants

1. **Medicines**: Every medicine document must have a valid identifier, unique barcode, non-negative price, and valid shelf location string.
2. **Customers**: Every customer record must have a unique identifier, name, and valid Indonesian phone number prefix.
3. **Doctors**: Doctors must have an active, rest, or holiday status and must match specified structural schemas.
4. **Sales**: Every transaction must have an associated invoice number, cashierName, non-negative subtotal and total, and an array of items.

## The Dirty Dozen (Vulnerability Attack Payloads)

Here are the 12 malicious payloads designed to test our security rules. All of these must return `PERMISSION_DENIED`.

1. **Privilege Escalation**: Attempting to write a non-string or 10MB string into a Medicine's `id`.
2. **Negative Price injection**: Attempting to create a medicine with a `sellPrice` of `-15000`.
3. **Shadow Fields**: Attempting to create a customer document with extra fields like `isAdmin: true` or `role: "SuperAdmin"`.
4. **Orphaned Checkup Record**: Writing a checkup history directly without a valid parent customer.
5. **PII Data Scraping**: Attempting a blanket read of all customer lists without active authorization context.
6. **Unauthorized Update**: Attempting to modify historical Transaction invoice numbers (`invoiceNumber`) or total cost after submission.
7. **Doctor Status Bypass**: Updating a doctor's on-duty schedule with an arbitrary unapproved status like "Absent" (only "Aktif", "Istirahat", "Libur" are allowed).
8. **Malicious ID Poisoning**: Creating a doctor document with a 2KB junk character ID.
9. **Negative Stock Injection**: Creating or updating stock count of medicine to a negative number like `-500`.
10. **Supplier Debt Spoofing**: Injecting arbitrary high numbers into supplier debt field as a non-authenticated request.
11. **Impersonated Cashier**: Creating a sales transaction with a spoofed cashier name or tampering with another user's invoice.
12. **System Settings Override**: Overwriting the global clinic settings with unapproved theme presets or third-party WhatsApp configurations.

## Test Runner Definition

The test script `firestore.rules.test.ts` executes these payloads to verify full denial of unverified or malformed operations.
