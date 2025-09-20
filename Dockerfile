# ----------------------
# 1. Build stage
# ----------------------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the React app (output goes to /app/dist or /app/build depending on setup)
RUN npm run build


# ----------------------
# 2. Runtime stage
# ----------------------
FROM nginx:stable-alpine

# Copy build output from first stage to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional, e.g. for React Router)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
