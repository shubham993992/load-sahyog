# Use official Python image
FROM python:3.11-slim
 
# Set working directory inside container
WORKDIR /app
 
# Copy requirements first (for faster builds)
COPY requirements.txt .
 
# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
 
# Copy all backend files
COPY . .
 
# Expose port 5000
EXPOSE 5000
 
# Start the Flask app with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]