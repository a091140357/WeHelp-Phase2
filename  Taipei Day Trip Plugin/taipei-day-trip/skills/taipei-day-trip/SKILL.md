---
name: taipei-day-trip-booking
description: Include Taipei Day Trip Booking Skill which define a procedure to book attractions.
---

Please strictly follow the procedure below:

1. Ask the user to enter a search keyword for Taipei Attractions.
2. Search attractions through the `搜尋台北市景點` tool of Taipei Day Trip MCP.
3. Render attractions including at least id and name.
4. Ask the user to enter attraction id, date, time by natural language. Always convert input data to our preferred format (convert date to YYYY-MM-DD, convert time to "morning" or "afternoon").
5. Create a new booking through the `預定景點導覽行程` tool of Taipei Day Trip MCP.
6. Finally, show a booking page link (e.g., /booking) for the user to complete ordering.