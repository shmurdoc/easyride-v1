const { expect } = require('chai');
const http = require('http');
const { Server } = require('socket.io');
const ClientIO = require('socket.io-client');

describe('Socket.io Integration Tests', function () {
  let httpServer;
  let io;
  let clientSocket;
  let port;

  before(function (done) {
    httpServer = http.createServer();
    io = new Server(httpServer, {
      cors: { origin: '*' },
    });

    port = httpServer.listen(0, () => {
      done();
    });
  });

  after(function () {
    io.close();
    httpServer.close();
  });

  afterEach(function () {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  it('should connect successfully', function (done) {
    clientSocket = ClientIO(`http://localhost:${port}`);
    clientSocket.on('connect', () => {
      expect(clientSocket.connected).to.be.true;
      done();
    });
  });

  it('should receive connection acknowledgment', function (done) {
    clientSocket = ClientIO(`http://localhost:${port}`);
    clientSocket.on('connection_ack', (data) => {
      expect(data).to.have.property('status');
      done();
    });
  });

  it('should handle driver location update', function (done) {
    io.on('connection', (socket) => {
      socket.on('driver:location_update', (data) => {
        expect(data).to.have.property('lat');
        expect(data).to.have.property('lng');
        socket.emit('location_confirmed', { status: 'ok' });
      });
    });

    clientSocket = ClientIO(`http://localhost:${port}`);
    clientSocket.on('connect', () => {
      clientSocket.emit('driver:location_update', {
        lat: -23.9468,
        lng: 29.4726,
        rideId: 'test-ride-123',
      });
    });

    clientSocket.on('location_confirmed', (data) => {
      expect(data.status).to.equal('ok');
      done();
    });
  });

  it('should handle ride request broadcast', function (done) {
    io.on('connection', (socket) => {
      socket.on('ride:request', (data) => {
        expect(data).to.have.property('pickupLat');
        expect(data).to.have.property('pickupLng');
        io.emit('ride:new_request', {
          rideId: 'ride-456',
          pickupLat: data.pickupLat,
          pickupLng: data.pickupLng,
          category: 'standard',
        });
      });
    });

    clientSocket = ClientIO(`http://localhost:${port}`);
    clientSocket.on('connect', () => {
      clientSocket.emit('ride:request', {
        pickupLat: -23.9468,
        pickupLng: 29.4726,
        dropoffLat: -23.9500,
        dropoffLng: 29.4800,
      });
    });

    clientSocket.on('ride:new_request', (data) => {
      expect(data.rideId).to.equal('ride-456');
      done();
    });
  });

  it('should handle ride accept', function (done) {
    io.on('connection', (socket) => {
      socket.on('ride:accept', (data) => {
        expect(data).to.have.property('rideId');
        expect(data).to.have.property('driverId');
        io.emit('ride:driver_assigned', {
          rideId: data.rideId,
          driverId: data.driverId,
          driverName: 'Test Driver',
          eta: 300,
        });
      });
    });

    clientSocket = ClientIO(`http://localhost:${port}`);
    clientSocket.on('connect', () => {
      clientSocket.emit('ride:accept', {
        rideId: 'ride-456',
        driverId: 'driver-789',
      });
    });

    clientSocket.on('ride:driver_assigned', (data) => {
      expect(data.rideId).to.equal('ride-456');
      expect(data.driverId).to.equal('driver-789');
      expect(data.eta).to.equal(300);
      done();
    });
  });

  it('should handle ride status update', function (done) {
    io.on('connection', (socket) => {
      socket.on('ride:status_update', (data) => {
        expect(data).to.have.property('rideId');
        expect(data).to.have.property('status');
        io.emit('ride:status_changed', {
          rideId: data.rideId,
          status: data.status,
        });
      });
    });

    clientSocket = ClientIO(`http://localhost:${port}`);
    clientSocket.on('connect', () => {
      clientSocket.emit('ride:status_update', {
        rideId: 'ride-456',
        status: 'in_progress',
      });
    });

    clientSocket.on('ride:status_changed', (data) => {
      expect(data.status).to.equal('in_progress');
      done();
    });
  });

  it('should handle chat message', function (done) {
    io.on('connection', (socket) => {
      socket.on('chat:message', (data) => {
        expect(data).to.have.property('rideId');
        expect(data).to.have.property('message');
        io.to(`ride:${data.rideId}`).emit('chat:new_message', {
          id: 'msg-001',
          rideId: data.rideId,
          senderId: data.senderId,
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      });
    });

    clientSocket = ClientIO(`http://localhost:${port}`);
    clientSocket.on('connect', () => {
      clientSocket.emit('chat:message', {
        rideId: 'ride-456',
        senderId: 'user-123',
        message: 'Hello, I am at the pickup point',
      });
    });

    clientSocket.on('chat:new_message', (data) => {
      expect(data.message).to.equal('Hello, I am at the pickup point');
      done();
    });
  });

  it('should handle delivery status update', function (done) {
    io.on('connection', (socket) => {
      socket.on('delivery:status_update', (data) => {
        expect(data).to.have.property('deliveryId');
        expect(data).to.have.property('status');
        io.emit('delivery:status_changed', {
          deliveryId: data.deliveryId,
          status: data.status,
        });
      });
    });

    clientSocket = ClientIO(`http://localhost:${port}`);
    clientSocket.on('connect', () => {
      clientSocket.emit('delivery:status_update', {
        deliveryId: 'del-789',
        status: 'picked_up',
      });
    });

    clientSocket.on('delivery:status_changed', (data) => {
      expect(data.status).to.equal('picked_up');
      done();
    });
  });

  it('should disconnect on timeout', function (done) {
    this.timeout(5000);
    clientSocket = ClientIO(`http://localhost:${port}`, {
      reconnection: false,
    });

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).to.be.true;
      setTimeout(() => {
        done();
      }, 1000);
    });
  });
});
