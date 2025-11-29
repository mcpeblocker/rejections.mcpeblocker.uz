#!/bin/bash

# Rejection Platform Launch Script
# Makes it easy to start, stop, and manage the platform

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║  🎯 Rejection Platform MVP            ║"
echo "║  Gamified Growth Tracker              ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

function show_menu() {
    echo ""
    echo "Choose an option:"
    echo "  1) 🚀 Start the platform (first time)"
    echo "  2) ▶️  Start the platform (quick)"
    echo "  3) ⏸️  Stop the platform"
    echo "  4) 🔄 Restart the platform"
    echo "  5) 📊 View logs"
    echo "  6) 🗑️  Reset database (delete all data)"
    echo "  7) ❌ Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
}

function start_first_time() {
    echo -e "${GREEN}🚀 Starting Rejection Platform (first time setup)...${NC}"
    echo "This will:"
    echo "  - Build all containers"
    echo "  - Initialize database"
    echo "  - Start all services"
    echo ""
    docker-compose up --build
}

function start_quick() {
    echo -e "${GREEN}▶️  Starting Rejection Platform...${NC}"
    docker-compose up
}

function stop() {
    echo -e "${YELLOW}⏸️  Stopping Rejection Platform...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Platform stopped${NC}"
}

function restart() {
    echo -e "${YELLOW}🔄 Restarting Rejection Platform...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ Platform restarted${NC}"
}

function view_logs() {
    echo -e "${BLUE}📊 Viewing logs (Ctrl+C to exit)...${NC}"
    echo ""
    echo "Choose which logs to view:"
    echo "  1) All services"
    echo "  2) Backend only"
    echo "  3) Frontend only"
    echo "  4) Database only"
    read -p "Enter choice (1-4): " log_choice
    
    case $log_choice in
        1) docker-compose logs -f ;;
        2) docker-compose logs -f backend ;;
        3) docker-compose logs -f frontend ;;
        4) docker-compose logs -f db ;;
        *) echo "Invalid choice" ;;
    esac
}

function reset_database() {
    echo -e "${YELLOW}⚠️  WARNING: This will delete ALL data!${NC}"
    read -p "Are you sure? Type 'yes' to confirm: " confirm
    
    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}🗑️  Resetting database...${NC}"
        docker-compose down -v
        echo -e "${GREEN}✅ Database reset complete${NC}"
        echo "Run option 1 to start fresh"
    else
        echo "Cancelled"
    fi
}

function check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}❌ Docker is not installed${NC}"
        echo "Please install Docker first: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${YELLOW}❌ Docker Compose is not installed${NC}"
        echo "Please install Docker Compose"
        exit 1
    fi
}

function show_info() {
    echo -e "${BLUE}📝 Quick Info:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5000"
    echo "  Database: localhost:5432"
    echo ""
    echo "  Username: rejectionuser"
    echo "  Database: rejectiondb"
    echo ""
}

# Main script
check_docker
show_info

while true; do
    show_menu
    
    case $choice in
        1) start_first_time ;;
        2) start_quick ;;
        3) stop ;;
        4) restart ;;
        5) view_logs ;;
        6) reset_database ;;
        7) 
            echo -e "${GREEN}👋 Goodbye! Keep growing! 💪${NC}"
            exit 0
            ;;
        *)
            echo -e "${YELLOW}Invalid choice. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
