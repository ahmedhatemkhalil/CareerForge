FROM langflowai/langflow:1.3.4

ENV LANGFLOW_HOST=0.0.0.0
ENV LANGFLOW_PORT=7860
ENV LANGFLOW_AUTO_LOGIN=false
ENV LANGFLOW_SAVE_DB_IN_CONFIG_DIR=true
ENV LANGFLOW_CONFIG_DIR=/app/langflow

EXPOSE 7860

VOLUME ["/app/langflow"]

CMD ["langflow", "run", "--host", "0.0.0.0", "--port", "7860"]
