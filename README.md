# Quick Inventory App

A mobile application developed with React Native and Expo for managing personal inventory. It allows users to securely log in, create categories, and manage items with real-time cloud synchronization.

## Features

* **User Authentication:** Secure email and password registration and login via Firebase Authentication.
* **Real-time Database:** CRUD (Create, Read, Update, Delete) operations for categories and items synchronized instantly using Firebase Firestore.
* **Global State Management:** Managed via Redux Toolkit (e.g., dynamic UI toggles between Grid and List views).
* **Persistent Storage:** User preferences and authentication states are saved locally across app restarts using AsyncStorage.
* **Form Validation:** Robust form handling and input validation using Formik and Yup.
* **Type Safety:** Strictly typed navigation and state management using TypeScript.

## Tech Stack

* **Framework:** React Native (Expo)
* **Language:** TypeScript
* **Backend as a Service:** Firebase (Auth, Firestore)
* **State Management:** Redux Toolkit
* **Navigation:** React Navigation (Native Stack)
* **Forms:** Formik & Yup

## Prerequisites

Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/)
* [Git](https://git-scm.com/)
* Expo CLI (installed globally or run via `npx`)

## Installation and Setup

**1. Clone the repository**
```bash
git clone <your-repository-url>
cd <your-project-folder>
