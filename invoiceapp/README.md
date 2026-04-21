# InvoiceFlow Frontend  
A simple and user friendly interface for managing customers and generating invoices seamlessly.

---

## The Problem

Many small businesses and individuals struggle to manage customer records and invoices efficiently. Most solutions are either too complex or not tailored for simple day to day use. This leads to disorganized records and time wasted on manual tracking.

---

## What It Does

* Allows users to create and manage customers  
* Enables invoice creation with automatic calculations  
* Provides a clean and simple interface for tracking data  
* Connects to a backend API for secure data handling  
* Supports user authentication for personalized access  

---

## Demo


---

## Tech Stack

* React  
Used to build the user interface and manage application state  

* Axios  
Handles communication between frontend and backend API  

* JavaScript  
Core language for application logic  

* CSS  
Used for styling and layout  

---

## How to Run It Locally

1. Clone the repository

```bash```
git clone https://github.com/queentaamy/invoiceapp-frontend
cd invoiceflow-frontend

2. Install dependencies

npm install

3. Start the development server

npm run dev

4. Open in your browser

http://localhost:5173

Backend API

This frontend connects to the deployed backend:

https://invoice-flow-cktz.onrender.com

 API Endpoints Used

Method	Endpoint	Description
POST	/signup	Create a new user
POST	/login	Authenticate user
GET	/customers	Fetch user customers
POST	/customers	Create a customer
GET	/invoices	Fetch invoices
POST	/invoices	Create an invoice

How to Test

1. Open the app in your browser
2. Sign up with a new account
3. Log in using your credentials
4. Create a customer
5. Generate an invoice for that customer

Alternatively, you can test the backend directly via:
https://invoice-flow-cktz.onrender.com/docs

Why This Project Matters

This project goes beyond a simple interface. It demonstrates how frontend and backend systems work together to solve real world problems. It focuses on usability, clean design, and secure user specific data handling.

Author

Asantewa Tutua Appiah
Frontend Developer transitioning into Backend and Cloud Engineering
