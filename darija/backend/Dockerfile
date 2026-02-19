FROM public.ecr.aws/lambda/python:3.11

# Install system dependencies for psycopg2
RUN yum install -y gcc libpq-devel 2>/dev/null || \
    microdnf install -y gcc libpq-devel 2>/dev/null || \
    pip install --no-cache-dir psycopg2-binary

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . ${LAMBDA_TASK_ROOT}

# Lambda handler
CMD ["app.main.handler"]
