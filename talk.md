- Single Socket
  - Share a websocket connection between multiple node processes through a local proxy server.

- Learn IDE architecture
  - FS Server
  - Terminal Server
  - Learn IDE Client
    - Atom Core (fork)
    - Tree View (fork)
    - integrated-learn-environment (Atom package)
      - extension
      - ide-init.coffee
  - Installer bundlers (Mac & Windows)

- Atom architecture
  - Multiple Processes
  - Browser Processes
  - Render Processes
  - Extensions

- IDE Design Limitations
  - Sockets cannot be shared across processes (processes cannot share complex objects)
  - Every single window will create

- Current Solution
  - Atom Fork - add websockets to the main browser process
  - Communicate via Atom's IPC module
    - show code

  - Pain
    - Need cleaner separation between IDE code and Atom core (keep them modular)
    - Need to wade through Atom's entire codebase to find our stuff
    - Makes it easy to create many dependencies with Atom's inner workings
    - Logic is separated out between two repos
    - Fork maintenance
      - show PR diff

- IDE v2: Extract all IDE logic out of Atom core and move into package

- Package challenges
  - Moving  it to a package is great, but there's a challenge due to how packages work
  - Packages are activated with every single new window in Atom (new render process) 
  - Every window = new web socket connection
  - Unneeded load on our IDE backend that can quickly escalate

- Thinking of a solution
  - Proxy server process
  - API that feels like using a Websocket but abstracts away the fact that you're sharing a connection with other processes
    - Diagram
  - Proxy server manages opening the connection and sending callbacks to all connected SingleSocket clients
  - How am I gonna manage communication between the clients and the proxy server

- BOOM! dnode and RPC
  - What is RPC? Remote Procedure Call, protocol
    - diagram
  - why use this instead of using a more conventional server (websockets maybe)
  - RPC creates really nice interfaces because you write code as if you had direct access to the remote's functions
  - Client can call server functions which in turn call client functions which can in turn call server functions
  - Really painless clean API for getting two processes to communicate and collaborate and do work together
  - Used a lot in distributed systems

- What is dnode?
  - og substack: node implementation of the RPC protocol
  - crazy usable
  - API example::
    - show code
  - recursive callbacks work too

  - how does this work exactly:
    - functions will run on the side they are defined on
    - dnode creates references to the other sides functions when client and server are connected

  - can cross tech stacks

- Show actual single-socket code
  - lib/server.js
  - singlesocket.js
  - Run test suite  / show test/ws-server.js

- Demo in Learn IDE

- Takeaways / Open Questions / Next Steps
  - Potential security issues: Authenticating cached websockets
  - When to kill the dnode server
  - Finding unused ports
  - Can we do this in the browser using shared web workers?
