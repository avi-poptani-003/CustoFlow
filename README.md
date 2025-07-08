# CRM Application

This is a full-stack CRM application designed to streamline customer relationship management for real estate businesses. It features a powerful Django backend and a responsive React frontend, providing a comprehensive suite of tools for managing leads, properties, and site visits.

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Backend (Django)](#backend-django)
  - [API Endpoints](#api-endpoints)
  - [Setup and Installation](#setup-and-installation)
- [Frontend (React)](#frontend-react)
  - [Pages and Functionality](#pages-and-functionality)
  - [Setup and Installation](#setup-and-installation-1)

## Project Structure

The project is organized into two main directories:

-   **`Frontend/`**: Contains the React application.
-   **`Backend/`**: Contains the Django application.

## Tech Stack

### Backend

-   **Django:** A high-level Python web framework.
-   **Django REST Framework:** A powerful and flexible toolkit for building Web APIs.
-   **JWT (JSON Web Token):** For secure authentication.

### Frontend

-   **React:** A JavaScript library for building user interfaces.
-   **Vite:** A fast build tool and development server.
-   **React Router:** For declarative routing.
-   **Axios:** For making HTTP requests to the backend.
-   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
-   **Recharts:** A composable charting library for data visualization.

## Features

-   **Secure Authentication:** JWT-based login, registration, and password management.
-   **Dashboard & Analytics:** Visualize key metrics with interactive charts and graphs.
-   **Lead Management:** Create, track, and manage leads with import/export functionality.
-   **Property Listings:** A comprehensive system for managing property details and images.
-   **Site Visit Scheduling:** A calendar-based interface for organizing and tracking site visits.
-   **Team Management:** Tools for administrators to manage user roles and permissions.
-   **Customizable Settings:** Personalize your profile and application theme.

## Backend (Django)

The Django backend provides a robust API for all CRM functionalities.

### API Endpoints

-   `/api/auth/login/`: User login
-   `/api/auth/refresh/`: Refresh JWT token
-   `/api/auth/logout/`: User logout
-   `/api/users/`: User management
-   `/api/auth/password-change/`: Change password
-   `/api/auth/password-reset/`: Request password reset
-   `/api/leads/`: Leads management
-   `/api/properties/`: Property management
-   `/api/site-visits/`: Site visit management

### Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Backend
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv env
    source env/bin/activate  # On Windows: env\Scripts\activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```
5.  **Start the development server:**
    ```bash
    python manage.py runserver
    ```

## Frontend (React)

The React frontend offers a modern and intuitive user interface for interacting with the CRM.

### Pages and Functionality

-   **Login/Register:** Secure user authentication.
-   **Dashboard:** Overview of key metrics and recent activities.
-   **Analytics:** In-depth data visualizations for leads, properties, and team performance.
-   **Leads:** Full CRUD interface for managing leads.
-   **Properties:** Gallery and detailed views of properties, with forms for adding and editing.
-   **Site Visits:** Calendar-based scheduling and tracking of site visits.
-   **Team Management:** Admin page for managing team members.
-   **Settings:** User profile customization and application settings.

### Setup and Installation

1.  **Navigate to the frontend directory:**
    ```bash
    cd Frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
