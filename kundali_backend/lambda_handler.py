"""
lambda_handler.py
------------------
Entry point used by AWS Lambda (configured as the Docker image CMD,
see Dockerfile). Wraps the FastAPI app with Mangum, which translates
API Gateway / Lambda Function URL events into ASGI calls and back.
"""
from mangum import Mangum

from app.main import app

handler = Mangum(app)
