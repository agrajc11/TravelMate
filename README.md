# TravelMate

TravelMate is a browser-based travel planner for organizing trips, itineraries, budgets, and favorite destinations.

## Run the project

1. Open `index.html` in a recent version of Chrome, Edge, or another modern browser.
2. Create an account with a supported email provider and sign in.
3. Use the dashboard sidebar to manage destinations, trips, itineraries, budgets, and favorites.

The project uses plain HTML, CSS, and JavaScript. It has no build step or package installation. Destination photos are hosted externally and require an internet connection.

## Features

- Account registration, login, and logout for demonstration.
- Destination search and category filters.
- User-specific trip creation, editing, search, and status filters.
- Activity planning for selected trips, with activity dates constrained to trip dates.
- Budget summaries and categorized expenses for each trip.
- Per-account favorite destinations with search and category filters.
- Itinerary sharing through the browser share sheet or a clipboard fallback.
- Print-friendly trip and itinerary views.
- Responsive dashboard layout for mobile, tablet, and desktop screens.

## Data and privacy

The application stores accounts, sessions, trips, itineraries, expenses, and favorites in browser Local Storage. Data is scoped by the signed-in demo account, but it remains on that browser and is not synchronized to other devices.

This is not production authentication: account passwords are stored in Local Storage and there is no server-side authorization or encryption. Do not use real passwords or sensitive personal information.

## Manual verification

The interface was checked in a browser for:

- Creating and listing trips, including older records without optional budget fields.
- Adding and removing trip expenses, totals, over-budget states, persistence, and account separation.
- Saving, searching, filtering, and removing favorite destinations.
- Sharing the selected trip's itinerary and printing trip/itinerary views.
- Protected-page redirects when signed out.
- Horizontal overflow on Home, Destinations, Trips, Itinerary, Budget Planner, Favorites, Login, and Registration at viewport widths of 320, 375, 768, and 1024 pixels.

## Project report

See [PROJECT_REPORT.md](./PROJECT_REPORT.md) for a submission-ready project overview and a template for student/course details.
