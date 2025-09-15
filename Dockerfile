FROM node:22-alpine
WORKDIR /app

COPY index.js .
COPY error.html .
COPY index.html .
COPY styles.css .
COPY ./favicon/ ./favicon/

# non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000
CMD ["node", "index.js"]
