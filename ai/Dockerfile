FROM langflowai/langflow:1.3.4

ENV LANGFLOW_HOST=0.0.0.0
ENV LANGFLOW_AUTO_LOGIN=false
ENV LANGFLOW_DATA_DIR=/data
ENV LANGFLOW_CONFIG_DIR=/data
ENV LANGFLOW_SAVE_DB_IN_CONFIG_DIR=true
ENV LANGFLOW_DATABASE_URL=sqlite:////data/langflow.db

EXPOSE 7860

CMD ["sh", "-c", "mkdir -p /data && exec langflow run --host 0.0.0.0 --port ${PORT:-7860} --database-url sqlite:////data/langflow.db"]
