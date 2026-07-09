FROM langflowai/langflow:1.3.4

# Railway volumes are owned by root; Langflow image runs non-root by default
USER root

ENV LANGFLOW_HOST=0.0.0.0
ENV LANGFLOW_AUTO_LOGIN=false
ENV LANGFLOW_DATA_DIR=/data
ENV LANGFLOW_CONFIG_DIR=/data
ENV LANGFLOW_SAVE_DB_IN_CONFIG_DIR=true
ENV LANGFLOW_DATABASE_URL=sqlite:////data/langflow.db
ENV RAILWAY_RUN_UID=0

EXPOSE 7860

# /data is provided by Railway volume mount; DB path set via LANGFLOW_DATABASE_URL env
CMD ["sh", "-c", "exec langflow run --host 0.0.0.0 --port ${PORT:-7860}"]
