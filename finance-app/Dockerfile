# Start from a Debian-based image with the Nginx web server
FROM nginx:stable-alpine

# Copy the static website files into the default Nginx public directory
COPY ./dist/ /usr/share/nginx/html

# Make sure that the files have the correct permissions
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx when the container is started
CMD ["nginx", "-g", "daemon off;"]
