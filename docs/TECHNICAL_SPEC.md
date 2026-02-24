# Snake Cartoon Deluxe 2.0 - Technical Specification

## 🏗 Architecture
- **Frontend**: HTML5 Canvas API + Tailwind CSS.
- **Rendering**: Custom render loop with checkerboard background optimization.
- **State Management**: Reactive state object for game configuration (Speed, AI count, etc.).

## 🐍 Core Systems
1. **Collision Engine**: Multi-entity collision detection (Snake-Wall, Snake-Self, Snake-Enemy, Bullet-Enemy).
2. **AI Logic**: Pathfinding-lite for enemy snakes to navigate and avoid self-collision.
3. **Skill System**: 
   - **Dash**: Dynamically modulates the move interval while decreasing the tail array length.
   - **Combat**: Projectile class with life-cycle management (culling off-screen bullets).

## 🚀 DevOps & Deployment
- **Containerization**: Nginx Alpine-based multi-file static serving.
- **CI/CD**: GitHub Actions deploying to Hostinger VPS via SSH with aggressive port recovery (fuser -k).
- **Endpoint**: http://76.13.181.119:8081
