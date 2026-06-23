# 1. Start with a lightweight version of Python
FROM python:3.11-slim

# 2. Set environment variables to optimize Python inside Docker
# Prevents Python from writing hidden .pyc files to the disk
ENV PYTHONDONTWRITEBYTECODE=1
# Ensures console output is sent directly to the terminal (great for viewing logs)
ENV PYTHONUNBUFFERED=1

# 3. Create a folder inside the container to hold our code
WORKDIR /app

# 4. Copy ONLY the requirements file first
COPY requirements.txt .

# 5. Install the Python dependencies
# --no-cache-dir prevents Docker from saving the downloaded installation files, keeping the image small
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the rest of your backend files into the container
COPY . .

# 7. Document the port the app will run on
EXPOSE 8000

# 8. The command to start the FastAPI server when the container runs
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]