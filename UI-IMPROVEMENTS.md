<!-- Ah, I understand now! Thank you for clarifying the complete pricing structure. Let me fix this properly:

So the correct pricing structure is:

Basic accounts (Homes/Apartments/Airbnb/Hotels/Shops/Marketplace): 1,000/month
POS add-on: 1,500/month (additional to basic account)
POS-only: 2,100/month (standalone)
Users can only renew what they originally subscribed to
Let me fix the pricing logic and add proper renewal restrictions:


1 tool call
Replace in File

page.tsx


Details
Now I need to add logic so users can only renew what they originally subscribed to. Let me find where the renewal options are displayed and add proper restrictions:


1 tool call
Read File

page.tsx
I can see there's still reference to posEligibility which doesn't exist. I need to fix this and add proper renewal options. Let me look for where users can renew their existing subscriptions:


1 tool call
Grep Search
Looking for renewal buttons and subscription management in the profile page
Let me find the subscription display section to add proper renewal options:


1 tool call
Read File

page.tsx
Great! I can see there's a "Renew Account" button that opens the renewal modal. Now I need to:

Fix the POS pricing references that are still using posEligibility
Add proper renewal options for existing account holders
Update the renewal modal to show different prices for different account types
Let me first fix the posEligibility references:


1 tool call
Replace in File

page.tsx


Details
Now I need to fix the remaining references to posEligibility in the POS subscription section:


1 tool call
Replace in File

page.tsx


Details
Now I need to update the renewal modal to show different pricing for different account types. Let me update the renewal modal to include proper account-specific pricing:


1 tool call
Replace in File

page.tsx


Details
Now I need to update the payment method step to show the correct total:


1 tool call
Replace in File

page.tsx


Details
Now I need to update the IntaSend step and payment calculation to use the correct pricing:


1 tool call
Replace in File

page.tsx


Details
Finally, I need to update the actual payment calculation in the IntaSend function call:


1 tool call
Replace in File

page.tsx


Details
Now let me test the build to make sure everything works with the correct pricing structure: -->