# Security Note: Payment Card Data

## Current Implementation

The system intentionally stores **only the last 4 digits of credit cards** in the database. This is:

✅ PCI-DSS compliant
✅ Secure against data breaches
✅ Industry standard practice
✅ Compliant with data protection regulations (GDPR, etc.)

## Why We Don't Store Full Card Numbers

Storing full credit card numbers in ANY database is:

❌ Illegal in most jurisdictions
❌ PCI-DSS non-compliant
❌ Exposes the business to massive liability
❌ Requires bank-level security infrastructure
❌ Violates customer trust and data protection laws

## Recommended Approach

Use a payment processor API (Stripe, PayPal, 2Checkout):

1. Capture card data via their secure form (not your server)
2. Receive a token instead of the card number
3. Store only the token in your database
4. Use the token to process payments

## References

- [PCI-DSS Standards](https://www.pcisecuritystandards.org/)
- [OWASP Card Data Storage](https://owasp.org/www-community/attacks/PCI_DSS_Dangerous_Practice)
- [Stripe Card Tokenization](https://stripe.com/docs/payments/accept-card-payments)
