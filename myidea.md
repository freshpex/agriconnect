------------------------------------------------
IDEA CAPTURE — AFRICA IGNITE HACKATHON SUBMISSION
------------------------------------------------

Idea Name: AgriConnect Market
Submission Date: April 13, 2026

Submitter Details
Name: Enoch Epekipolu
Team Name: Urside
Contact: epekipoluenoch@gmail.com/+2347069039485

------------------------------------------------
GSMA PILLAR ALIGNMENT
------------------------------------------------

Primary Pillar: Digital Agriculture & Rural Development
Supporting Pillar: Digital Identity & Anti-Fraud

AgriConnect Market directly addresses GSMA's vision of leveraging Open Gateway APIs to close the digital divide in agriculture — the largest employment sector in Sub-Saharan Africa. By integrating identity verification (KYC Match, SIM Swap, Number Verification) with location intelligence and quality-of-service controls, the platform aligns with GSMA's goals of enabling trusted, inclusive, and resilient digital services for underserved rural populations.

------------------------------------------------
THEME
------------------------------------------------

Theme 2: Digital Agriculture & Rural Connectivity

Context: Agriculture employs ~60% of the SSA workforce; rural connectivity gaps persist.
Focus: Enable smarter farming and rural services through connectivity and verified digital identity.

------------------------------------------------
IDEA SUMMARY
------------------------------------------------

Problem
Many smallholder farmers in Sub-Saharan Africa lose income due to limited market access, unreliable connectivity, and lack of trust in digital transactions. Fraudulent account takeovers and unverified seller identities further erode trust. Buyers struggle to confirm the authenticity and physical location of produce, making it difficult to transact confidently with remote farmers.

Proposed Solution
AgriConnect Market is a mobile-first digital marketplace that combines CAMARA network APIs with a trusted farmer verification stack to allow smallholder farmers to sell produce directly to buyers. The platform uses KYC Match and SIM Swap detection to establish strong verified digital identities for farmers, Location Verification to confirm farm authenticity, Device Status to adapt the experience to network conditions, and QoD to guarantee reliable transaction flows.

Expected Benefits
- Farmers gain access to a wider buyer market without relying on middlemen
- Buyers gain confidence through verified farm locations and authenticated seller identities
- Fraud and account takeover risk is reduced via SIM Swap monitoring
- Platform remains functional in low-connectivity rural environments
- Scales across Sub-Saharan Africa using Nokia Network-as-Code APIs

------------------------------------------------
PROJECT TYPE
------------------------------------------------

Type: Mobile Application (B2B2C Marketplace)
Stage: Prototype / Hackathon MVP

------------------------------------------------
API USAGE — NOKIA NETWORK-AS-CODE
------------------------------------------------

Core APIs (Mandatory)

1. KYC Match
   - Purpose: Verifies that a farmer's registered mobile identity matches their stated national ID details during onboarding
   - Use Case: Prevents fraudulent registrations; establishes a trusted, verified farmer identity on the platform
   - Category: Digital Identity & Anti-Fraud

2. SIM Swap
   - Purpose: Detects recent SIM card swaps on a farmer's registered mobile number before allowing critical account actions (login, listing creation, order confirmation)
   - Use Case: Protects farmer accounts from SIM-swap fraud and unauthorized takeovers — a common attack vector in SSA mobile ecosystems
   - Category: Digital Identity & Anti-Fraud

3. Number Verification
   - Purpose: Silently verifies that the mobile number used during onboarding is active on the device, without requiring OTP input
   - Use Case: Frictionless identity confirmation during farmer registration; improves onboarding completion rates in low-literacy environments
   - Category: Digital Identity & Anti-Fraud

Extended APIs

4. Location Verification
   - Purpose: Confirms that a farmer's device is physically located at their registered farm coordinates
   - Use Case: Validates farm authenticity at the time of produce listing; displays a "location-verified" badge on listings to build buyer trust
   - Category: Network Intelligence

5. Device Status
   - Purpose: Detects whether a farmer's device is online, offline, or on a poor-quality connection
   - Use Case: Triggers offline-mode with automatic sync when connectivity is poor; prevents failed transactions in low-signal rural areas
   - Category: Network Intelligence

6. QoD — Quality on Demand
   - Purpose: Requests a temporary elevated quality-of-service session during order confirmation
   - Use Case: Ensures that the critical order confirmation step completes reliably even in congested or low-bandwidth rural networks
   - Category: Programmable Connectivity

API Usage Summary: 6 Nokia CAMARA APIs across 3 categories (Digital Identity & Anti-Fraud, Network Intelligence, Programmable Connectivity)

------------------------------------------------
OVERVIEW
------------------------------------------------

AgriConnect Market is a mobile-first platform that enables smallholder farmers in Sub-Saharan Africa to sell produce directly to buyers using telecom network intelligence.

AgriConnect Market solves this by combining CAMARA network APIs with a digital marketplace to create a trusted, identity-verified, location-authenticated, and connectivity-aware platform that works even in low-network rural areas.

Core Features
Farmer Identity Verification: KYC Match validates farmer identity against national ID at onboarding; SIM Swap detection monitors accounts for fraudulent takeover attempts on every login and high-value action
Number Verification: Silent mobile number confirmation during registration — no OTP friction
Farm & Produce Listings: Farmers list crops, prices, and quantities with verified location badges
Location Verification: Uses Location Verification API to confirm the farmer is physically at their farm when creating listings; builds buyer trust through authenticated farm coordinates
Nearby Buyer Matching: Connects farmers with buyers within a specified geographic area
Connectivity-Aware Experience: Uses Device Status API to detect poor network conditions; supports offline actions with automatic sync when connectivity improves
Reliable Transactions: QoD (Quality on Demand) ensures stable, guaranteed network sessions during order confirmation
Direct Marketplace Access: Farmers sell directly to verified buyers, eliminating middlemen

Good-to-Have Features
SMS/USSD support for non-smartphone users
AI-based price recommendations for crops
Transport and delivery coordination features
Farmer ratings and trust scores
Cooperative/group selling options

Constraints
Limited internet connectivity in rural areas
Low smartphone adoption among some farmers
Dependence on telecom API availability
Initial user adoption and trust-building may take time

Known Issues
GPS/location inaccuracies in remote areas may affect verification
Listings may become outdated if not regularly updated
Network instability may affect real-time communication
Delivery logistics are not fully optimized in early versions

Implementation
Mobile App: React Native
Backend: Node.js / Express
Database: MongoDB / Firebase
APIs (CAMARA / Nokia Network-as-Code):
- KYC Match (identity verification at onboarding)
- SIM Swap (account fraud protection)
- Number Verification (silent mobile number confirmation)
- Location Verification (farm authenticity)
- Device Status (connectivity-aware UX)
- QoD / Quality on Demand (reliable transaction sessions)

Final Result
The final prototype will be a working mobile application that:

Allows farmers to register with full KYC-verified and SIM-swap-protected digital identity
Enables listing of farm produce with verified location authentication
Connects farmers to nearby buyers with trust indicators (verified badges)
Demonstrates connectivity-aware ordering and guaranteed transaction flows via QoD
Functions effectively in low-connectivity rural environments

Post-Hackathon Plan
After the hackathon, AgriConnect Market will be expanded by:

Partnering with agricultural cooperatives and buyers
Integrating mobile money platforms for seamless payments
Adding real-time logistics and delivery tracking
Enhancing trust systems with AI-based fraud detection and agentic price intelligence
Scaling across multiple regions in Sub-Saharan Africa

The long-term vision is to build a scalable digital marketplace that empowers farmers, improves income, and strengthens rural economies across Sub-Saharan Africa.