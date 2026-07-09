FROM langflowai/langflow:1.3.4

ENV LANGFLOW_HOST=0.0.0.0
ENV LANGFLOW_AUTO_LOGIN=false
ENV LANGFLOW_SAVE_DB_IN_CONFIG_DIR=true
ENV LANGFLOW_CONFIG_DIR=/app/langflow

EXPOSE 7860

# Railway injects PORT; default 7860 for local docker compose
CMD ["sh", "-c", "langflow run --host 0.0.0.0 --port ${PORT:-7860}"]
