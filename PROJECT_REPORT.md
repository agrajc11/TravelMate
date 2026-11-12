# TravelMate - Project Report

## Submission details

- Student name: [Enter student name]
- Course/program: [Enter course or program]
- Institution: [Enter institution]
- Submission date: [Enter date]

## Abstract

TravelMate is a client-side travel planning application. It helps users collect destination ideas, organize trips and activities, track planned expenses, and save favorite places. The application is built with HTML, CSS, and vanilla JavaScript, and stores demonstration data in browser Local Storage.

## Problem statement

Travel plans can be spread across notes and separate tools. Travelers need a simple place to organize trip details, schedule activities, track expected costs, and retain destination ideas.

## Objectives

- Provide a clear interface for browsing and searching destinations.
- Let users create, update, and manage their trips.
- Organize dated activities under the correct trip.
- Compare trip budgets with categorized planned expenses.
- Save favorite destinations for later reference.
- Support sharing and printing an itinerary.
- Provide a responsive experience on common screen sizes.

## Technology

- HTML5 for page structure and forms.
- CSS3 for dashboard styling, responsive layouts, and print layouts.
- Vanilla JavaScript for page behavior and data handling.
- Browser Local Storage for demonstration accounts and per-user travel data.

No frontend framework, backend service, or database is required to run the project.

## Main modules

### Destinations

Displays a curated set of destinations. Users can search by name or location, filter by category, and save or remove destinations from Favorites.

### My Trips

Supports trip creation, editing, deletion, search, and upcoming/completed status filtering. Trip dates, traveler count, destination, notes, and an estimated budget are stored with each trip.

### Itinerary

Stores activities per trip, including date, time, location, and notes. Activity dates are validated against the selected trip. A selected itinerary can be shared as text or printed.

### Budget Planner

Shows each trip's estimated budget, planned expense total, remaining balance, and usage indicator. Users can add categorized expenses and remove them with confirmation.

### Favorites

Stores favorite destinations per account and provides destination search and category filtering.

### Account demonstration

Registration and login provide a basic local demonstration of account-specific data. Protected pages redirect signed-out visitors to Login.

## Data design

Data is kept in Local Storage and separated by account identifier. Current storage groups include account/session data, trips, itineraries, trip expenses, and favorite destinations. The application does not send this data to a server.

## Verification

Browser checks covered trip and itinerary rendering, budget totals and expense persistence, favorite save/remove/filter behavior, account separation, signed-out redirects, share text content, print styles, and responsive overflow.

Responsive checks covered Home, Destinations, My Trips, Itinerary, Budget Planner, Favorites, Login, and Registration at 320, 375, 768, and 1024 pixel viewport widths.

## Limitations

- Local Storage is limited to one browser profile and is not backed up or synchronized.
- Demo passwords are stored in Local Storage; authentication is not suitable for real accounts.
- There is no server-side authorization, database, or multi-device synchronization.
- Destination imagery is loaded from external image URLs.
- Browser support for native sharing varies; the application falls back to copying itinerary text when possible.

## Conclusion

TravelMate combines destination discovery, trip organization, itinerary planning, budget tracking, and saved destinations in one responsive browser application. Its modular pages and per-account Local Storage structure provide a foundation for future improvements such as secure backend authentication, cloud synchronization, and richer budget reports.
