# Use Node.js as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# ---- Build frontend first ----
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build

# ---- Backend setup ----
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# The port your app listens on
EXPOSE 3000

# Command to start the server
CMD ["node", "index.js"]