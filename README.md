# 🛍️ Luxe E-Commerce Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Pydantic AI](https://img.shields.io/badge/Pydantic_AI-F05023?style=for-the-badge&logo=ai&logoColor=white)](https://pydantic.dev/)

Welcome to Luxe E-Commerce! Think of this project as a complete digital shopping mall. It has a **Frontend** (the beautiful storefront you see), a **Backend** (the busy warehouse manager fulfilling orders), a **Database** (the inventory ledger), and a **Pydantic AI Assistant** (your intelligent virtual salesman).

---

## ✨ Key Features (Simple Explanation)

- **🔐 Secure Vault (Authentication)**: Register and login safely. We shred (hash) your passwords so nobody can read them.
- **📦 Store Shelves (Products)**: View our dynamic catalog. You can filter by category (Men, Women, Kids) easily.
- **🛒 Shopping Cart**: Pick items and keep them in your basket until you are ready to buy.
- **📜 Receipts (Order History)**: Track the things you've successfully purchased.
- **🤖 Virtual Salesman (AI Chatbot)**: A super-smart assistant powered by **Pydantic AI** (Llama 3.1) that can instantly search the warehouse and recommend exact products you ask for!
- **🔭 X-Ray Vision (Logfire)**: We use **Pydantic Logfire** to seamlessly monitor our warehouse (backend) and AI Salesman in real-time.
- **🛠️ Manager's Desk (Admin Dashboard)**: A special area for store owners to add, update, or remove clothing items.

---

## 🛠️ Technology Stack

We built this mall using the best modern materials:

### Frontend (The Storefront)
- **Native Vanilla JS** (Loads the store visually instantly)
- **CSS** (Helps make things look pretty)

### Backend (The Warehouse Manager)
- **FastAPI** (Extremely fast Python worker that handles requests)
- **MongoDB Atlas** (Flexible digital filing cabinets for data)
- **Pydantic AI & Groq** (The smart brain of our AI Salesman)
- **Pydantic Logfire** (The security camera monitoring everything inside)

---

## 📖 Complete Documentation

Want to learn how it all works? We have easy-to-read guides!
Check the **[`docs/README.md`](./docs/README.md)** for the full table of contents, including a simple **Terminology Guide**!

---

## 🚀 Quick Start (Running the Store)

We created a simple switch to turn on the whole mall at once:

1. **Get the Keys (Setup)**
   - Create a `.env` file in the main folder (if one was provided) layout out your database link.
   - Make sure you have **Node.js** and **Python** installed on your computer.

2. **Flick the Switch (Run Everything)**
   ```bash
   python main.py
   ```
   *This magic script will:*
   - Wake up the warehouse manager (FastAPI backend).
   - Automatically serve the native frontend.
   - Open your browser to `http://localhost:8000`.

---

## 🏗️ Manual Tool Setup

If you prefer turning things on one by one:

### Start the Server
```bash
python -m venv venv
venv\Scripts\activate   # (Or source venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
python main.py
```
*(The native Frontend is gracefully embedded directly inside the python command!)*

---

## 📖 Available Doors (API Endpoints)

FastAPI gives us a great map of all the backend doors:
- Go to **`http://localhost:8080/docs`** to see the interactive map!

Here are the main doors (Endpoints):
| What it does | Method | Door (URL) |
| :--- | :--- | :--- |
| Create account | `POST` | `/register` |
| Login | `POST` | `/login` |
| See clothes | `GET` | `/products` |
| Add to cart | `POST` | `/cart/add` |
| See cart | `GET` | `/cart/{email}` |
| Place order | `POST` | `/orders` |
| Talk to AI | `POST` | `/chat` |

---

## 📝 License

Distributed under the **MIT License**. Have fun building!
