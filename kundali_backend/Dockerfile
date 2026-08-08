# AWS Lambda Python 3.12 base image (includes the Lambda Runtime Interface Client)
FROM public.ecr.aws/lambda/python:3.12

# pyswisseph is a C-extension package; the Lambda Python base image ships
# with build tools already available via yum for source builds, but a
# manylinux wheel exists for pyswisseph so no compiler install is normally
# required. The gcc line below is kept as a safety net in case pip has to
# fall back to a source build on a given architecture.
RUN yum install -y gcc gcc-c++ make && yum clean all

COPY requirements.txt ${LAMBDA_TASK_ROOT}/requirements.txt
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

COPY app ${LAMBDA_TASK_ROOT}/app
COPY lambda_handler.py ${LAMBDA_TASK_ROOT}/lambda_handler.py

# Lambda handler path: file.function -> lambda_handler.handler
CMD ["lambda_handler.handler"]
