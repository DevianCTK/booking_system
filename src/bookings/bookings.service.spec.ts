import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { LocationsService } from '../locations/locations.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Location } from '../locations/entities/location.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

describe('BookingsService', () => {
  let service: BookingsService;
  let locationsService: LocationsService;

  const mockBookingRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((booking) => Promise.resolve({ id: '1', ...booking })),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockLocationsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: LocationsService,
          useValue: mockLocationsService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    locationsService = module.get<LocationsService>(LocationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const getValidLocation = (): Partial<Location> => ({
    id: 'loc-1',
    department: 'EFM',
    capacity: 10,
    openDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    openFrom: '09:00',
    openTo: '18:00',
    children: [],
  });

  const getValidBookingDto = (): CreateBookingDto => ({
    locationId: 'loc-1',
    department: 'EFM',
    attendees: 5,
    // A Monday in UTC
    startTime: '2026-06-15T10:00:00.000Z',
    endTime: '2026-06-15T11:00:00.000Z',
  });

  describe('Create Booking', () => {
    it('should explicitly store startTime and endTime as Date objects', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation());
      const dto = getValidBookingDto();
      
      await service.create(dto);
      
      expect(mockBookingRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        startTime: expect.any(Date),
        endTime: expect.any(Date),
      }));
    });
  });

  describe('Rule 1 - Location Exists', () => {
    it('should pass if location is found', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation());
      const result = await service.create(getValidBookingDto());
      expect(result.location.id).toBe('loc-1');
    });

    it('should throw NotFoundException if location is not found', async () => {
      mockLocationsService.findOne.mockResolvedValue(null);
      await expect(service.create(getValidBookingDto())).rejects.toThrow(NotFoundException);
    });
  });

  describe('Location Configuration Requirements', () => {
    const errorMsg = 'Location is not bookable. Required booking configuration is missing.';

    it('should throw BadRequestException if department is null', async () => {
      mockLocationsService.findOne.mockResolvedValue({ ...getValidLocation(), department: null });
      await expect(service.create(getValidBookingDto())).rejects.toThrow(new BadRequestException(errorMsg));
    });

    it('should throw BadRequestException if capacity is null', async () => {
      mockLocationsService.findOne.mockResolvedValue({ ...getValidLocation(), capacity: null });
      await expect(service.create(getValidBookingDto())).rejects.toThrow(new BadRequestException(errorMsg));
    });

    it('should throw BadRequestException if openDays is null', async () => {
      mockLocationsService.findOne.mockResolvedValue({ ...getValidLocation(), openDays: null });
      await expect(service.create(getValidBookingDto())).rejects.toThrow(new BadRequestException(errorMsg));
    });

    it('should throw BadRequestException if openFrom is null', async () => {
      mockLocationsService.findOne.mockResolvedValue({ ...getValidLocation(), openFrom: null });
      await expect(service.create(getValidBookingDto())).rejects.toThrow(new BadRequestException(errorMsg));
    });

    it('should throw BadRequestException if openTo is null', async () => {
      mockLocationsService.findOne.mockResolvedValue({ ...getValidLocation(), openTo: null });
      await expect(service.create(getValidBookingDto())).rejects.toThrow(new BadRequestException(errorMsg));
    });

    it('should throw BadRequestException on update if location configuration is missing', async () => {
      const mockBooking = { 
        id: '1', 
        location: { ...getValidLocation(), department: null },
        startTime: new Date('2026-06-15T10:00:00.000Z'),
        endTime: new Date('2026-06-15T11:00:00.000Z'),
      };
      mockBookingRepository.findOne.mockImplementation((query) => {
        if (query.where.id === '1') return Promise.resolve(mockBooking);
        return Promise.resolve(null);
      });
      await expect(service.update('1', { attendees: 8 })).rejects.toThrow(new BadRequestException(errorMsg));
    });
  });

  describe('Rule 2 - Bookable Location', () => {
    it('should throw BadRequestException if location has children', async () => {
      const locationWithChildren = { ...getValidLocation(), children: [{ id: 'loc-2' } as Location] };
      mockLocationsService.findOne.mockResolvedValue(locationWithChildren);
      await expect(service.create(getValidBookingDto())).rejects.toThrow(
        new BadRequestException('Location is not bookable. It has sub-locations.')
      );
    });
  });

  describe('Rule 3 - Department Matching', () => {
    it('should throw BadRequestException if departments mismatch', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation());
      const dto = { ...getValidBookingDto(), department: 'FSS' };
      await expect(service.create(dto)).rejects.toThrow(new BadRequestException('Department mismatch'));
    });

    it('should pass if departments match', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation());
      const dto = { ...getValidBookingDto(), department: 'EFM' };
      await expect(service.create(dto)).resolves.toBeDefined();
    });
  });

  describe('Rule 4 - Capacity Validation', () => {
    it('should throw BadRequestException if attendees exceed capacity', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation()); // Capacity 10
      const dto = { ...getValidBookingDto(), attendees: 11 };
      await expect(service.create(dto)).rejects.toThrow(
        new BadRequestException('Attendees (11) exceed location capacity (10)')
      );
    });

    it('should pass if attendees exactly match capacity', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation());
      const dto = { ...getValidBookingDto(), attendees: 10 };
      await expect(service.create(dto)).resolves.toBeDefined();
    });
  });

  describe('Rule 5 - Time Validation', () => {
    it('should pass if booking is on a valid day and time', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation());
      await expect(service.create(getValidBookingDto())).resolves.toBeDefined();
    });

    it('should throw BadRequestException if booking is on a weekend (Saturday)', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation());
      const dto = { 
        ...getValidBookingDto(), 
        // 2026-06-20 is a Saturday
        startTime: '2026-06-20T10:00:00.000Z', 
        endTime: '2026-06-20T11:00:00.000Z' 
      };
      await expect(service.create(dto)).rejects.toThrow(
        new BadRequestException('Location is not open on Sat')
      );
    });

    it('should throw BadRequestException if booking starts before open time', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation()); // Opens at 09:00 local
      const dto = { 
        ...getValidBookingDto(), 
        startTime: '2026-06-15T08:00:00.000', 
        endTime: '2026-06-15T10:00:00.000' 
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if booking ends after close time', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation()); // Closes at 18:00 local
      const dto = { 
        ...getValidBookingDto(), 
        startTime: '2026-06-15T17:00:00.000', 
        endTime: '2026-06-15T19:00:00.000' 
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if startTime >= endTime', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation());
      const dto = { 
        ...getValidBookingDto(), 
        startTime: '2026-06-15T11:00:00.000', 
        endTime: '2026-06-15T10:00:00.000' 
      };
      await expect(service.create(dto)).rejects.toThrow(
        new BadRequestException('Start time must be before end time')
      );
    });

    it('should throw BadRequestException if cross-day booking is attempted', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation());
      const dto = { 
        ...getValidBookingDto(), 
        // Mon 10:00 to Tue 11:00
        startTime: '2026-06-15T10:00:00.000Z', 
        endTime: '2026-06-16T11:00:00.000Z' 
      };
      await expect(service.create(dto)).rejects.toThrow(
        new BadRequestException('Booking cannot span multiple days')
      );
    });

    it('should throw BadRequestException if overlapping booking exists', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation());
      mockBookingRepository.findOne.mockResolvedValue({ id: 'existing-1' }); // Mock existing booking overlap
      const dto = getValidBookingDto();
      
      await expect(service.create(dto)).rejects.toThrow(
        new BadRequestException('Location already has a booking during the requested time period')
      );
    });

    it('should allow booking if no overlap exists', async () => {
      mockLocationsService.findOne.mockResolvedValue(getValidLocation());
      mockBookingRepository.findOne.mockResolvedValue(null); // No overlap
      const dto = getValidBookingDto();
      
      await expect(service.create(dto)).resolves.toBeDefined();
    });
  });

  describe('Read Bookings', () => {
    it('should return all bookings', async () => {
      const mockBookings = [{ id: '1' }];
      mockBookingRepository.find.mockResolvedValue(mockBookings);
      
      const result = await service.findAll();
      expect(result).toEqual(mockBookings);
    });

    it('should return specific booking', async () => {
      const mockBooking = { id: '1' };
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      
      const result = await service.findOne('1');
      expect(result).toEqual(mockBooking);
    });
  });

  describe('Update Booking', () => {
    it('should update and re-validate booking successfully', async () => {
      const mockBooking = {
        id: '1',
        location: getValidLocation(),
        department: 'EFM',
        attendees: 5,
        startTime: new Date('2026-06-15T10:00:00.000Z'),
        endTime: new Date('2026-06-15T11:00:00.000Z'),
      };
      mockBookingRepository.findOne.mockImplementation((query) => {
        if (query.where.id === '1') return Promise.resolve(mockBooking);
        return Promise.resolve(null); // Overlap check returns null
      });
      mockBookingRepository.save.mockResolvedValue({ ...mockBooking, attendees: 8 });
      
      const result = await service.update('1', { attendees: 8 });
      expect(result.attendees).toBe(8);
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it('should explicitly convert partial update startTime to Date object and preserve endTime', async () => {
      const mockBooking = {
        id: '1',
        location: getValidLocation(),
        department: 'EFM',
        attendees: 5,
        startTime: new Date('2026-06-15T10:00:00.000Z'),
        endTime: new Date('2026-06-15T11:00:00.000Z'),
      };
      mockBookingRepository.findOne.mockImplementation((query) => {
        if (query.where.id === '1') return Promise.resolve(mockBooking);
        return Promise.resolve(null);
      });
      mockBookingRepository.save.mockImplementation((entity) => Promise.resolve(entity));
      
      const result = await service.update('1', { startTime: '2026-06-15T10:15:00.000Z' });
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.startTime.toISOString()).toBe('2026-06-15T10:15:00.000Z');
      expect(result.endTime).toBeInstanceOf(Date); // preserved
      expect(result.endTime.toISOString()).toBe('2026-06-15T11:00:00.000Z');
    });

    it('should explicitly convert partial update endTime to Date object and preserve startTime', async () => {
      const mockBooking = {
        id: '1',
        location: getValidLocation(),
        department: 'EFM',
        attendees: 5,
        startTime: new Date('2026-06-15T10:00:00.000Z'),
        endTime: new Date('2026-06-15T11:00:00.000Z'),
      };
      mockBookingRepository.findOne.mockImplementation((query) => {
        if (query.where.id === '1') return Promise.resolve(mockBooking);
        return Promise.resolve(null);
      });
      mockBookingRepository.save.mockImplementation((entity) => Promise.resolve(entity));
      
      const result = await service.update('1', { endTime: '2026-06-15T10:45:00.000Z' });
      expect(result.endTime).toBeInstanceOf(Date);
      expect(result.endTime.toISOString()).toBe('2026-06-15T10:45:00.000Z');
      expect(result.startTime).toBeInstanceOf(Date); // preserved
      expect(result.startTime.toISOString()).toBe('2026-06-15T10:00:00.000Z');
    });
  });

  describe('Delete Booking', () => {
    it('should delete booking successfully', async () => {
      const mockBooking = { id: '1' };
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.remove.mockResolvedValue(true);
      
      await service.remove('1');
      expect(mockBookingRepository.remove).toHaveBeenCalledWith(mockBooking);
    });
  });
});
