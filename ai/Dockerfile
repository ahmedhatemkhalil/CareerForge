FROM langflowai/langflow:1.3.4

ENV LANGFLOW_HOST=0.0.0.0
ENV LANGFLOW_AUTO_LOGIN=false
ENV LANGFLOW_DATA_DIR=/data
ENV LANGFLOW_CONFIG_DIR=/data
ENV LANGFLOW_SAVE_DB_IN_CONFIG_DIR=true
ENV LANGFLOW_DATABASE_URL=sqlite:////data/langflow.db

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 7860

ENTRYPOINT ["/entrypoint.sh"]
