# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## 1. INTRODUCTION

### 1.1 Purpose

This Software Requirements Specification (SRS) document details the functional and non-functional requirements for the **Lina Restaurant & Bar Digital Menu & WhatsApp Direct-Ordering System**. It serves as the authoritative blueprint for engineering, quality assurance, system deployment, and milestone verification.

### 1.2 Scope of the System

The system is a mobile-first digital menu catalog, interactive cart, and automated order generation engine paired with an administrative backend. The web application allows guests to scan table/bar QR codes, browse itemized menu offerings across all food, drink, and hookah categories, customize orders, and redirect pre-formatted order payloads directly to the restaurant's designated WhatsApp Business account. The Admin Portal grants restaurant personnel management controls for menu data, stock availability toggles, and persistent order logging for business analytics.

### 1.3 Definitions, Acronyms, and Abbreviations

* **SRS:** Software Requirements Specification
* **PWA:** Progressive Web Application
* **CRUD:** Create, Read, Update, Delete
* **Deep Link:** A URI directing a user into a mobile application (`wa.me` protocol) with pre-populated contextual data
* **Payload:** The URL-encoded text string containing the formatted customer order details
* **SKU:** Stock Keeping Unit / Item Variant identifier

---

## 2. OVERALL SYSTEM ARCHITECTURE & USER ROLES

### 2.1 User Classes and Characteristics

* **Guest / Customer:** Mobile or desktop web client accessing the public application via QR code or direct URL. No authentication required.
* **Kitchen / Floor Staff / Cashier:** Front-of-house staff receiving incoming WhatsApp messages to process payments, verify customer delivery addresses, and coordinate fulfillment.
* **Super Admin / Store Manager:** Authenticated restaurant administrator accessing the management dashboard to modify menu items, update prices, toggle item availability, and inspect sales logs.

### 2.2 System Architecture Diagram (Workflow)

```text
[Guest Device]
   │
   ├──> Scans QR Code / Navigates to Custom Domain (HTTPS)
   ├──> Fetches Dynamic Menu from Database (Indexed by Category)
   ├──> Adds Items (with Variant / Modifiers) to Local Client State (Cart)
   ├──> Proceeds to Checkout (Inputs Fulfillment Details & Order Type)
   │
   └───[On Checkout Submission]
           │
           ├── 1. Async POST API Request ──> Saves Order in DB (Analytics Log)
           │
           └── 2. Client-Side Redirect  ──> Opens WhatsApp via Deep Link
                                               │
                                               ▼
                                  [Restaurant WhatsApp DM]
                             (Pre-populated with Order Payload)

```

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Module 1: Public Digital Menu & Exploration

* **FR-1.1 Category Navigation:** The system shall display horizontal/sticky category tabs allowing users to filter dishes and beverages (e.g., *Rice & Pastas*, *Proteins*, *Soups & Swallows*, *Shawarma*, *Arabian Tea*, *Beers & Stouts*, *Spirits & Wines*, *Mocktails*, *Cocktails*, *Shisha*).
* **FR-1.2 Item Detail Presentation:** Each menu card shall render the item name, description/ingredients (where applicable), base price, variant options (e.g., Small Pack vs. Big Pack), and an availability badge (`In Stock` / `Sold Out`).
* **FR-1.3 Dynamic Search & Filtering:** The system shall provide an instant text search bar filtering items in real-time by title and ingredient keywords.
* **FR-1.4 Out-of-Stock Locking:** When an item is marked `Out of Stock` by the admin, the "Add to Cart" button shall be disabled, displaying a clear visual badge indicating unavailability.

### 3.2 Module 2: Cart & Customization Engine

* **FR-2.1 Modifier & Option Selection:** The cart engine shall support single-select variants (e.g., *Chicken Shawarma: Single Sausage @ ₦3,000* vs. *Double Sausage @ ₦3,200* vs. *No Sausage @ ₦2,900*) and pack sizes (e.g., *Fried Rice Small Pack @ ₦2,300* vs. *Big Pack @ ₦2,900*).
* **FR-2.2 Special Instructions / Notes:** Each line item shall allow optional textual instructions (e.g., *"Make it very spicy"*, *"No ice in drink"*).
* **FR-2.3 Cart State Persistence:** Active cart state (selected items, quantities, notes) shall be persisted in client storage (`localStorage` / session cache) to prevent accidental loss on page refreshes.
* **FR-2.4 Real-time Subtotal Computation:** The cart drawer shall dynamically compute subtotal prices based on item units, pack variants, and add-on quantities.

### 3.3 Module 3: Checkout Modal & WhatsApp Deep Link Generation

* **FR-3.1 Fulfillment Modes:** The checkout modal shall require the customer to select one of three fulfillment types:
* **Dine-In:** Requires Table / Seat Number.
* **Takeaway / Pickup:** Requires Customer Name and Phone Number.
* **Delivery:** Requires Customer Name, Phone Number, and Full Delivery Address.


* **FR-3.2 Order Reference Generation:** The system shall generate an alphanumeric Order ID (e.g., `#LRB-1082`).
* **FR-3.3 Database Order Dispatch:** Prior to triggering WhatsApp, the system shall asynchronously push the order payload to the backend database to preserve analytics records.
* **FR-3.4 WhatsApp Payload Formatting:** The application shall format the complete order into a URL-encoded string and invoke `[https://wa.me/](https://wa.me/)<RESTAURANT_NUMBER>?text=<ENCODED_STRING>`.

**Standardized Order Payload Format:**

```text
🍽️ *NEW ORDER - #LRB-1082*
--------------------------------
👤 *Customer:* [Customer Name]
📞 *Phone:* [Phone Number]
🛵 *Fulfillment:* [Dine-in / Pickup / Delivery]
📍 *Location / Address:* [Table No / Delivery Street Address]

🛒 *Order Items:*
• [Qty]x [Item Name] ([Variant]) - ₦[Price]
  ↳ _Note: [Item Note]_

💰 *Subtotal:* ₦[Total Amount]
--------------------------------
_Order generated via Lina Digital Menu._
Please confirm total with delivery fee and share payment details.

```

### 3.4 Module 4: Custom QR Code System

* **FR-4.1 QR Code Routing:** Provide high-resolution vector (SVG/PNG) QR codes that encode the production URL of the digital menu.
* **FR-4.2 Table-Specific QR Support (Optional / Extensible):** System shall support query parameter deep links (e.g., `[https://menu.domain.com/?table=12](https://menu.domain.com/?table=12)`) to auto-populate the table number in the checkout modal.

### 3.5 Module 5: Admin Management Dashboard

* **FR-5.1 Authentication:** Secure login using email/password credentials with session token management.
* **FR-5.2 Menu CRUD Operations:**
* **Create:** Add new items with title, category, description, base price, and optional variants.
* **Read:** Tabular view of all catalog items filterable by category.
* **Update:** Real-time modification of prices, titles, variants, and descriptions.
* **Delete / Archive:** Soft-delete or archive discontinued items.


* **FR-5.3 Stock Availability Toggle:** Instant toggle switch to update an item's availability (`In Stock` / `Out of Stock`) reflected immediately across the public UI.
* **FR-5.4 Order & Analytics Logs:**
* Read-only tabular log of all initiated checkout orders (Order ID, Timestamp, Customer Info, Items, Subtotal, Fulfillment Type).
* Aggregate sales volume metrics (Daily/Weekly/Monthly totals, most ordered items).



---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance & Latency

* **Page Load Time:** First Contentful Paint (FCP) shall be under 1.5 seconds on a standard 3G/4G mobile network.
* **Payload Optimization:** Assets, images, and bundles shall be minified and served via CDN caching to minimize bandwidth consumption.

### 4.2 Usability & Responsiveness

* **Mobile-First Design:** Optimized for one-thumb mobile interaction (screen sizes 360px to 430px) and scalable to tablets and desktop displays.
* **Design Consistency:** Strict alignment with the Lina brand identity 
use theme: 
@theme {
  /* ==========================================================================
     SURFACES & STRUCTURE (Warm Cream & Rich Espresso Tones)
     ========================================================================== */
  --color-surface: #FAF7F2;
  --color-surface-dim: #EFECE6;
  --color-surface-bright: #FFFFFF;
  --color-surface-container-lowest: #FFFFFF;
  --color-surface-container-low: #F6F3ED;
  --color-surface-container: #EDE9E1;
  --color-surface-container-high: #E4DFD5;
  --color-surface-container-highest: #DDD7CB;
  --color-surface-variant: #EDE9E1;

  --color-on-surface: #161311;
  --color-on-surface-variant: #594D44;
  --color-inverse-surface: #1E1A17;
  --color-inverse-on-surface: #FAF7F2;

  --color-outline: #8A7E72;
  --color-outline-variant: #D9D2C5;
  --color-surface-tint: #C5943A;

  /* ==========================================================================
     PRIMARY (Lina Metallic Gold Accent)
     ========================================================================== */
  --color-primary: #C5943A;
  --color-on-primary: #FFFFFF;
  --color-primary-container: #F9F0DC;
  --color-on-primary-container: #5F3C18;
  --color-inverse-primary: #E7BC66;

  /* ==========================================================================
     SECONDARY / ACCENT (Lina Wine / Burgundy Red)
     ========================================================================== */
  --color-secondary: #6B1322;
  --color-on-secondary: #FFFFFF;
  --color-secondary-container: #FCE7EA;
  --color-on-secondary-container: #3D0711;

  /* ==========================================================================
     TERTIARY (Deep Charcoal / Espresso Neutral)
     ========================================================================== */
  --color-tertiary: #2E2722;
  --color-on-tertiary: #FFFFFF;
  --color-tertiary-container: #EAE6DF;
  --color-on-tertiary-container: #161311;

  /* ==========================================================================
     STATUS & FEEDBACK (Error / Alert)
     ========================================================================== */
  --color-error: #B3261E;
  --color-on-error: #FFFFFF;
  --color-error-container: #F9DEDC;
  --color-on-error-container: #410E0B;

  /* ==========================================================================
     FIXED ROLES & SHADES
     ========================================================================== */
  --color-primary-fixed: #F2DEB4;
  --color-primary-fixed-dim: #E7BC66;
  --color-on-primary-fixed: #3B2305;
  --color-on-primary-fixed-variant: #8E5E1C;

  --color-secondary-fixed: #FAD1D8;
  --color-secondary-fixed-dim: #E89CA9;
  --color-on-secondary-fixed: #3D0711;
  --color-on-secondary-fixed-variant: #6B1322;

  --color-tertiary-fixed: #E4DFD5;
  --color-tertiary-fixed-dim: #C5BDAF;
  --color-on-tertiary-fixed: #161311;
  --color-on-tertiary-fixed-variant: #453B32;

  /* Brand Shell Backgrounds */
  --color-background: #FAF7F2;
  --color-on-background: #161311;

  /* ==========================================================================
     TYPOGRAPHY (Playfair Display for Headings, Plus Jakarta Sans for UI)
     ========================================================================== */
  --font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-serif: 'Playfair Display', Georgia, Cambria, 'Times New Roman', Times, serif;

  /* Type Scale */
  --text-display-xl: 3.75rem;
  --text-headline-lg: 2.25rem;
  --text-headline-md: 1.75rem;
  --text-title-lg: 1.25rem;
  --text-body-lg: 1.125rem;
  --text-body-md: 0.9375rem;
  --text-label-caps: 0.75rem;

  --leading-display-xl: 1.1;
  --leading-headline-lg: 1.2;
  --leading-headline-md: 1.3;
  --leading-title-lg: 1.4;
  --leading-body-lg: 1.6;
  --leading-body-md: 1.5;
  --leading-label-caps: 1;

  --tracking-display-xl: -0.025em;
  --tracking-headline-lg: -0.015em;
  --tracking-title-lg: -0.005em;
  --tracking-label-caps: 0.12em;

  /* ==========================================================================
     BORDER RADIUS (Modern Curved UI)
     ========================================================================== */
  --radius-sm: 0.375rem;
  --radius: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --radius-full: 9999px;

  /* ==========================================================================
     SPACING & LAYOUT
     ========================================================================== */
  --spacing-unit: 8px;
  --spacing-xs: 4px;
  --spacing-sm: 12px;
  --spacing-md: 24px;
  --spacing-lg: 40px;
  --spacing-xl: 72px;
  --spacing-gutter: 20px;
  --spacing-margin-mobile: 16px;
  --spacing-margin-desktop: 48px;

  /* ==========================================================================
     SHADOWS & ELEVATION (Soft, Tinted Warm Luxury Shadows)
     ========================================================================== */
  --shadow-ambient: 0 12px 32px -4px rgba(22, 19, 17, 0.06), 0 4px 12px -2px rgba(22, 19, 17, 0.03);
  --shadow-card: 0 2px 8px -2px rgba(22, 19, 17, 0.04), 0 1px 4px -1px rgba(22, 19, 17, 0.02);
  --shadow-elevated: 0 20px 40px -8px rgba(22, 19, 17, 0.1);
  --shadow-wine: 0 10px 25px -5px rgba(107, 19, 34, 0.25);
  --shadow-gold: 0 10px 25px -5px rgba(197, 148, 58, 0.25);

  /* Legacy / Quick Aliases */
  --color-border: var(--color-outline-variant);
  --color-accent: var(--color-secondary);
}

### 4.3 Reliability & Availability

* **Uptime:** The web application and backend API shall maintain a 99.9% uptime target.
* **Graceful Degradation:** If the database logging API encounters network failure, the client-side WhatsApp redirect must still execute without blocking the customer's checkout process.

### 4.4 Security & Data Integrity

* **Transport Encryption:** All traffic enforced over HTTPS with an active SSL certificate.
* **Admin Route Protection:** All admin CRUD endpoints guarded by server-side authentication middleware.
* **Input Sanitization:** Client-side and server-side validation on all form inputs and text fields to prevent injection attacks.

---

## 5. TECHNICAL SPECIFICATIONS & STACK

* **Frontend:** React , Tailwind CSS (v4 Theme configuration), Lucide Icons
* **State Management:** React Context API / Zustand (Local Cart State)
* **Backend & Database:** Node.js / Mongodb, Express, Serverless API routes with PostgreSQL (Drizzle ORM) or MongoDB
* **Deployment & Hosting:** Cloudflare / Coolify / VPS with Custom Domain & Automated SSL
* **External Integrations:** WhatsApp Universal Deep Link (`wa.me` API protocol)

---

## 6. PROJECT CONSTRAINTS & BOUNDARY CONDITIONS

* **Payment Processing:** Out of scope for client-side automated settlement. The platform generates and routes orders; payment requests, account number transfers, and verification are handled manually by the restaurant staff via WhatsApp.
* **Delivery Logistics:** Dispatch rider assignment, delivery fee computation, and dispatch execution are managed externally by restaurant staff.
* **Two-Way Chat:** The web app does not embed an in-app live chat widget; all post-checkout customer communication occurs natively inside WhatsApp.




### Client or Product Info
Name: Lina Restaurant and Bar
•⁠  ⁠WhatsApp number Contact(s): 09165196622

•⁠  ⁠⁠Email Address: linarestaurantandbar@gmail.com

•⁠  ⁠⁠Domain name: linarestaurantandbar.com.ng

•⁠  ⁠⁠Address: 27/29 6th Avenue, Gwarinpa Abuja



MENU: 
* **Currency:** Nigerian Naira (₦)

---

### **1. Rice & Pastas / Main Dishes** *(Without Protein)*

| Item | Small Pack | Big Pack |
| --- | --- | --- |
| Fried Rice | ₦2,300 | ₦2,900

 |
| Jollof Rice | ₦2,300 | ₦2,900

 |
| White Rice | ₦2,300 | ₦2,900 / ₦3,800

 |
| Coconut Rice | ₦3,300 | ₦3,800

 |
| Village Rice | ₦3,300 | ₦3,800

 |
| Vegetable Rice | ₦3,800 | ₦4,300

 |
| Chinese Rice | ₦3,800 | ₦4,300

 |
| Asun Rice | ₦3,800 | ₦4,300

 |
| Caribbean Rice | ₦3,800 | ₦4,300

 |
| Jollof Spaghetti | ₦2,300 | ₦9,200

 |
| Milky Spaghetti | ₦3,800 | ₦4,300

 |
| Porridge Yam | ₦2,800 | ₦3,800

 |
| Porridge Beans (1 Spoon) | — | ₦1,500

 |

---

### **2. Proteins, Fish & Pepper Soups**

* **Turkey:** ₦5,000


* **Chicken Lap:** ₦4,000


* **Chicken Wings:** ₦5,000


* **Cow Leg:** ₦3,000


* **Cowtail:** ₦3,000


* **Bush Meat:** ₦10,000


* **Goat Meat:** ₦1,000


* **Beef:** ₦1,000


* **Kpomo:** ₦1,000


* **Assorted Meat:** ₦1,500


* **Dried Fish:** ₦3,500


* **Kote Fish:** ₦2,000


* **Titus Fish:** ₦3,000


* **Fried Catfish Tail / Head:** ₦5,000


* **Fried Catfish Middle:** ₦4,000


* **Roasted Fish:** ₦8,000


* **Asun:** ₦5,000


* **Assorted Pepper Soup:** ₦5,000


* **Fresh Fish Pepper Soup:** ₦4,000 / ₦5,000


* **Goat Meat Pepper Soup:** ₦3,000


* **Egg:** ₦500


* **Egg Sauce:** ₦1,000


* **Moi Moi:** ₦1,000



---

### **3. Sides & Local Delicacies**

* **Salad (1 Portion):** ₦500


* **Plantain:** ₦1,000


* **Takeaway Pack:** ₦300


* **Isi Ewu:** ₦10,000


* **Nkwobi:** ₦10,000


* **Cow Head:** ₦5,000



---

### **4. Soups** *(Without Protein)*

* **Okro Soup:** ₦1,600


* **Egusi Soup:** ₦1,600


* **Ogbono Soup:** ₦1,600


* **Vegetable Soup:** ₦1,900


* **Bitterleaf Soup:** ₦1,900


* **Oha Soup:** ₦1,900


* **Vegetable Okro:** ₦2,500


* **Efo Riro:** ₦2,500


* **White Soup:** ₦2,900


* **Afang Soup:** ₦2,500


* **Banga Soup:** ₦8,000


* **Fisherman Soup:** ₦15,000


* **Seafood Okro:** ₦15,000



---

### **5. Swallows**

* **Semo:** ₦300


* **Garri:** ₦300


* **Pounded Yam:** ₦500


* **Fufu:** ₦500


* **Starch:** ₦500


* **Wheat:** ₦500



---

### **6. Shawarma**

* **Goat Meat Shawarma:** ₦4,000


* **Chicken Shawarma (No Sausage):** ₦2,900


* **Chicken Shawarma (Single Sausage):** ₦3,000


* **Chicken Shawarma (Double Sausage):** ₦3,200


* **Beef Shawarma (No Sausage):** ₦2,900


* **Beef Shawarma (Single Sausage):** ₦3,000


* **Beef Shawarma (Double Sausage):** ₦3,200



---

### **7. SAF Arabian Herbal Tea**

* **Normal Arabian Herbal Tea (Small Jug):** ₦3,000


* **Normal Arabian Herbal Tea (Big Jug):** ₦4,000


* **Double Double Arabian Herbal Tea (Small Jug):** ₦4,000


* **Double Double Arabian Herbal Tea (Big Jug):** ₦5,000



---

### **8. Shisha**

* **Shisha (Complete Pot):** ₦8,000


* **Extra Coal:** ₦500



---

### **9. Spirits, Whiskeys, Wines & Champagnes (Bottles)**

* **Martell Blue Swift:** ₦130,000


* **Martell V.S:** ₦90,000


* **Chivas Regal 15yrs:** ₦65,000


* **Jameson Black:** ₦65,000


* **Monkey Shoulder:** ₦55,000


* **Black Label:** ₦55,000


* **Chivas Regal 12yrs:** ₦45,000


* **Campari:** ₦40,000


* **Absolut Vodka:** ₦40,000


* **Olmeca Tequila:** ₦40,000


* **Baileys:** ₦35,000


* **Jack Daniel's:** ₦35,000


* **Red Label:** ₦35,000


* **American Honey:** ₦30,000


* **Jameson Green:** ₦30,000


* **William Lawson:** ₦30,000


* **Andre:** ₦25,000


* **Nederburg:** ₦25,000


* **Sheep Dog (Big):** ₦25,000


* **Baron Romero:** ₦20,000


* **Baron de Valls:** ₦20,000


* **Carlo Rossi / Carlo Rossi Ice:** ₦20,000


* **Four Cousins:** ₦20,000


* **Agor Wine:** ₦20,000


* **4th Street (White & Red):** ₦20,000


* **Agavales Tequila:** ₦17,000


* **Sombrero Tequila:** ₦17,000


* **Flirt Vodka:** ₦15,000


* **Magic Moments:** ₦13,000


* **Best Cream:** ₦13,000


* **Smirnoff Ice X1:** ₦13,000


* **Big Gordon Gin:** ₦10,000


* **Imperial Blue:** ₦10,000


* **1960 Roots:** ₦10,000


* **Eva Wine:** ₦9,500


* **Chamdor:** ₦8,500


* **Amarula:** ₦7,000


* **Smirnoff Ice X1 (Medium):** ₦5,000


* **X1 Small:** ₦3,000


* **Small Best Cream:** ₦3,000


* **Small Gordon:** ₦3,000


* **Sheep Dog (Small):** ₦1,500



---

### **10. Shots**

* **Olmeca Tequila Shot:** ₦3,000


* **Vodka Shot:** ₦3,000


* **Whiskey Shot:** ₦3,000



---

### **11. Beers, Stouts & Ciders**

* **Double Black (Can):** ₦3,500


* **Big Stout:** ₦2,000


* **Smirnoff Ice:** ₦2,000


* **Double Black (Bottle):** ₦2,000


* **Heineken:** ₦1,800


* **Legend Extra Stout:** ₦1,800


* **Gulder:** ₦1,500


* **Star:** ₦1,500


* **Life Continental:** ₦1,500


* **Goldberg:** ₦1,500


* **Goldberg Black:** ₦1,500


* **Origin Beer:** ₦1,500


* **Desperados:** ₦1,500


* **Castle Lite:** ₦1,500


* **Medium Stout:** ₦1,500


* **Extra Smooth:** ₦1,500


* **Flying Fish:** ₦1,500


* **33 Export:** ₦1,500


* **Budweiser / Budweiser Royal:** ₦1,500


* **Trophy Stout:** ₦1,500


* **Goldberg (Can):** ₦1,400


* **Tiger:** ₦1,300


* **Trophy:** ₦1,300


* **Hero:** ₦1,300


* **Radler:** ₦1,300


* **Legend Twist:** ₦1,300



---

### **12. Soft Drinks, Energy Drinks & Bitters**

* **Water:** ₦300


* **Coke / Pepsi:** ₦800


* **Amstel Malt / Maltina / Fayrouz:** ₦1,000


* **Origin Bitters / Ace Bitters:** ₦1,500


* **Energy Drinks (Climax, Supa/Kommando, Fearless, Bullet, Red Bull):** ₦2,500


* **Double Black (Energy):** ₦2,000



---

### **13. Fresh Juices, Smoothies & Packaged Dairy**

* **Zobo Drink:** ₦1,000


* **Tiger Nut:** ₦1,500


* **Fresh Orange / Mixed / Watermelon Juice:** ₦2,000


* **Packaged Juice (Chivita / Chi Exotic / Hollandia Yoghurt):** ₦3,500


* **Mix Fruit Smoothies:** ₦6,500 *(Options: Pineapple-Banana-Ginger-Apple / Watermelon-Banana-Avocado / Banana-Coconut Milk-Pineapple)*



---

### **14. Mocktails (Non-Alcoholic) — ₦5,500 (unless noted)**

* **PTK Passion:** Pineapple juice, Grenadine, Orange juice, Coconut cream


* **Virgin Pina Colada:** Coconut cream, Pineapple juice, Whipped cream


* **Virgin Jamaica:** Orange juice, Pineapple juice, Grenadine syrup


* **Sweet Sunrise:** Pineapple juice, Cranberry juice, Grenadine, Lemon juice


* **African Dance:** Orange juice, Strawberry, Dash of ginger


* **Virgin Mojito:** Lemon juice, Soda water, Mint leaves


* **Lemonade / Minted Lemonade:** Lemon juice, Water, Sugar (± Mint leaves)


* **Chapman (7Up or Sprite Variant):** 7Up/Sprite, Fanta, Grenadine syrup, Bitters


* **African Pop:** Coconut Milk, Pineapple juice, Blue Curacao


* **Pineapple Sunrise:** Pineapple, Orange, Grenadine


* **Virgin Sex on the Beach:** Cranberry, Orange juice, Pineapple juice, Grenadine


* **Virgin Strawberry Daiquiri (₦7,000):** Strawberry Fruit, Lime Juice, Simple Syrup



---

### **15. Cocktails (Alcoholic) — ₦6,500 each**

* **Margarita / Strawberry Margarita:** Tequila, Triple Sec, Lime/Lemon juice (± Strawberry)


* **Daiquiri / Strawberry Daiquiri:** White Rum, Lime/Lemon juice, Simple syrup (± Strawberry)


* **Cosmopolitan:** Vodka, Cranberry juice, Triple Sec, Lime


* **White Russian:** Vodka, Coffee Liqueur, Heavy Cream


* **Old Fashioned:** Whiskey, Simple syrup, Angostura bitters


* **Negroni:** Gin, Campari, Sweet Vermouth


* **Casablanca Special:** Coconut Rum, Pineapple juice, Cranberry juice, Grenadine


* **Pina Colada:** Rum, Coconut Cream, Coconut syrup, Pineapple juice


* **Long Island Iced Tea:** Tequila, Vodka, Triple Sec, White Rum, Gin, Cola, Sugar Syrup, Lemon


* **London Mile:** Gin, Ginger, Soda water


* **Sex on the Beach:** Vodka, Peach Schnapps, Cranberry juice, Orange juice


* **Tropical Punch:** Rum, Orange juice, Pineapple juice, Cranberry juice, Grenadine


* **Screwdriver:** Vodka, Orange juice


* **Abuja Ladies:** Gin, Syrup


* **7 & 7:** Whiskey, 7Up


* **Tequila Sunrise:** Tequila, Grenadine, Orange juice


* **Blue Ocean:** Rum, Pineapple, Blue Curacao


* **Blue Hour:** White Rum, Vodka, Blue Curacao, Pineapple juice


* **Whiskey Sour:** Whiskey, Sugar syrup, Lemon, Egg, Bitters, Nutmeg


* **Mojito:** White Rum, Soda, Syrup, Mint leaf



---

### **16. Milkshakes & PTK Shooters — ₦5,500 each**

* **Banana Shake:** Ice cream, Skimmed milk, Banana


* **Vanilla Milk Shake:** Ice cream, Skimmed milk, Yogurt


* **Oreo Shake Special:** Ice cream, Skimmed milk, Oreo biscuit


* **Strawberry Shake:** Strawberry fruit, Ice cream, Skimmed milk


* **Flaming Lamborghini (Shooter):** Sambuca, Coffee Liqueur, Blue Curacao, Baileys


* **Slippery Nipple (Shooter):** Sambuca, Baileys, Grenadine



---
