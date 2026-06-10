import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationType } from './enums/location-type.enum';

describe('LocationsService', () => {
  let service: LocationsService;

  const mockLocationRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((location) => Promise.resolve({ id: 'loc-new', ...location })),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(Location),
          useValue: mockLocationRepository,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const getValidCreateDto = (): CreateLocationDto => ({
    name: 'Test Room',
    locationNumber: 'TEST-01',
    type: LocationType.ROOM,
  });

  describe('Create Location', () => {
    it('should create location if parent is valid', async () => {
      mockLocationRepository.findOne.mockResolvedValue({ id: 'parent-1' });
      const dto = { ...getValidCreateDto(), parentId: 'parent-1' };
      
      const result = await service.create(dto);
      
      expect(result.id).toBe('loc-new');
      expect(result.parent?.id).toBe('parent-1');
      expect(mockLocationRepository.save).toHaveBeenCalled();
    });

    it('should create root location if parent is not provided', async () => {
      const dto = getValidCreateDto();
      
      const result = await service.create(dto);
      
      expect(result.id).toBe('loc-new');
      expect(result.parent).toBeNull();
      expect(mockLocationRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if parent is invalid', async () => {
      mockLocationRepository.findOne.mockResolvedValue(null);
      const dto = { ...getValidCreateDto(), parentId: 'invalid-parent' };
      
      await expect(service.create(dto)).rejects.toThrow(
        new NotFoundException('Parent location with ID invalid-parent not found')
      );
    });

    it('should throw BadRequestException if locationNumber is duplicated (caught by DB)', async () => {
      const dto = getValidCreateDto();
      
      // Mock the save method to throw a Postgres unique violation error
      mockLocationRepository.save.mockRejectedValueOnce({ code: '23505' });

      await expect(service.create(dto)).rejects.toThrow(
        new BadRequestException(`Location with number ${dto.locationNumber} already exists`)
      );
    });
  });

  describe('Delete Location', () => {
    it('should remove the location successfully (cascades via DB constraint)', async () => {
      const mockLocation = { id: 'loc-1', name: 'Test Room' };
      mockLocationRepository.findOne.mockResolvedValue(mockLocation);
      
      await service.remove('loc-1');
      
      expect(mockLocationRepository.remove).toHaveBeenCalledWith(mockLocation);
    });

    it('should throw NotFoundException if location to delete is not found', async () => {
      mockLocationRepository.findOne.mockResolvedValue(null);
      
      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Read Locations', () => {
    it('should return location tree', async () => {
      const mockLocations = [{ id: 'loc-1', children: [] }];
      mockLocationRepository.find.mockResolvedValue(mockLocations);
      
      const result = await service.findAll();
      
      expect(result).toEqual(mockLocations);
      expect(mockLocationRepository.find).toHaveBeenCalledWith({
        where: { parent: expect.anything() },
        relations: { children: { children: true } },
      });
    });

    it('should return specific location details', async () => {
      const mockLocation = { id: 'loc-1' };
      mockLocationRepository.findOne.mockResolvedValue(mockLocation);
      
      const result = await service.findOne('loc-1');
      
      expect(result).toEqual(mockLocation);
      expect(mockLocationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'loc-1' },
        relations: { children: true, parent: true },
      });
    });
  });

  describe('Update Location', () => {
    it('should update location successfully', async () => {
      const mockLocation = { id: 'loc-1', capacity: 10 };
      mockLocationRepository.findOne.mockResolvedValue(mockLocation);
      mockLocationRepository.save.mockResolvedValue({ ...mockLocation, capacity: 20 });
      
      const result = await service.update('loc-1', { capacity: 20 });
      
      expect(result.capacity).toBe(20);
      expect(mockLocationRepository.save).toHaveBeenCalled();
    });
  });
});
