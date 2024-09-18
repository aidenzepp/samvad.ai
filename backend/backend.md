# Application Setup and Installation Guide

This guide explains how to set up the necessary environment, install dependencies, and run the application.

## Prerequisites

- Python 3.x installed
- MongoDB installed
- `virtualenv` installed for creating a virtual environment

## Step 1: Set Up the Python Virtual Environment

1. Navigate to the project directory in the terminal.
2. Create a virtual environment if it’s not already provided:
    ```bash
    python3 -m venv venv
    ```
3. Activate the virtual environment:
    - **On Windows:**
        ```bash
        venv\\Scripts\\activate
        ```
    - **On macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```

## Step 2: Install Python Dependencies

1. With the virtual environment activated, install the required Python packages using `pip`:
    ```bash
    pip install -r requirements.txt
    ```

## Step 3: Install MongoDB

1. **For macOS (using Homebrew):**
    ```bash
    brew tap mongodb/brew
    brew install mongodb-community@7.0
    ```

2. **For Ubuntu/Debian:**
    ```bash
    sudo apt-get install -y mongodb
    ```

3. **For Windows:**
    - Download the MongoDB installer from the [official MongoDB website](https://www.mongodb.com/try/download/community).
    - Follow the installation instructions.

## Step 4: Run the Application

1. Make sure the virtual environment is activated.
2. Navigate to the project directory where `main.py` is located.
3. Run the application:
    ```bash
    python3 main.py
    ```

## Step 5: Stopping the Application

To stop the application, simply press `Ctrl + C` in the terminal where it's running.
