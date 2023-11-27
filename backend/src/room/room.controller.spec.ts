import { RoomService } from "./room.service";

describe('RoomService', () => {
  it('should be defined', () => {
    const service = new RoomService();
    expect(service).toBeDefined();
  });
});
