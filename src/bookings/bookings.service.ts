import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Not } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { LocationsService } from '../locations/locations.service';
import { Location } from '../locations/entities/location.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly locationsService: LocationsService,
  ) {}

  private async validateBookingRules(location: Location, createBookingDto: CreateBookingDto, bookingIdToExclude?: string) {
    // Rule 1: Location must exist (already checked before this call) and be bookable
    // Assuming bookable means it has no children (e.g., it's a Room, not a Building or Floor)
    if (location.children && location.children.length > 0) {
      throw new BadRequestException('Location is not bookable. It has sub-locations.');
    }

    // Required Configuration Check
    if (
      !location.department ||
      !location.capacity ||
      !location.openDays ||
      !location.openFrom ||
      !location.openTo
    ) {
      throw new BadRequestException('Location is not bookable. Required booking configuration is missing.');
    }

    // Rule 2: Department Matching
    if (location.department && location.department !== createBookingDto.department) {
      throw new BadRequestException('Department mismatch');
    }

    // Rule 3: Capacity Check
    if (location.capacity && createBookingDto.attendees > location.capacity) {
      throw new BadRequestException(`Attendees (${createBookingDto.attendees}) exceed location capacity (${location.capacity})`);
    }

    // Rule 4: Time Validation
    const startDate = new Date(createBookingDto.startTime);
    const endDate = new Date(createBookingDto.endTime);

    if (startDate >= endDate) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Timezone Note: Using local server time to evaluate dates against local location configurations.
    if (
      startDate.getFullYear() !== endDate.getFullYear() ||
      startDate.getMonth() !== endDate.getMonth() ||
      startDate.getDate() !== endDate.getDate()
    ) {
      throw new BadRequestException('Booking cannot span multiple days');
    }

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startDay = daysOfWeek[startDate.getDay()];

    if (location.openDays && location.openDays.length > 0) {
      if (!location.openDays.includes(startDay)) {
        throw new BadRequestException(`Location is not open on ${startDay}`);
      }
    }

    if (location.openFrom && location.openTo) {
      const formatTime = (date: Date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      const startTimeString = formatTime(startDate);
      const endTimeString = formatTime(endDate);

      if (startTimeString < location.openFrom || endTimeString > location.openTo) {
        throw new BadRequestException(`Booking time is outside of location open hours (${location.openFrom} - ${location.openTo})`);
      }
    }

    // Rule 5: Overlap Validation
    const whereClause: any = {
      location: { id: location.id },
      startTime: LessThan(endDate),
      endTime: MoreThan(startDate),
    };
    
    if (bookingIdToExclude) {
      whereClause.id = Not(bookingIdToExclude);
    }

    const overlappingBooking = await this.bookingRepository.findOne({ where: whereClause });
    if (overlappingBooking) {
      throw new BadRequestException('Location already has a booking during the requested time period');
    }
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const location = await this.locationsService.findOne(createBookingDto.locationId);
    if (!location) {
      throw new NotFoundException(`Location with ID ${createBookingDto.locationId} not found`);
    }

    await this.validateBookingRules(location, createBookingDto);

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      startTime: new Date(createBookingDto.startTime),
      endTime: new Date(createBookingDto.endTime),
      location,
    });

    return this.bookingRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({ relations: { location: true } });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: { location: true },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);

    if (updateBookingDto.locationId) {
      const location = await this.locationsService.findOne(updateBookingDto.locationId);
      if (!location) {
        throw new NotFoundException(`Location with ID ${updateBookingDto.locationId} not found`);
      }
      booking.location = location;
    }

    // If updating, we should re-validate. For simplicity, merge and validate as if it's a new CreateBookingDto
    const mergedForValidation = {
      locationId: booking.location.id,
      department: updateBookingDto.department || booking.department,
      attendees: updateBookingDto.attendees || booking.attendees,
      startTime: updateBookingDto.startTime || booking.startTime.toISOString(),
      endTime: updateBookingDto.endTime || booking.endTime.toISOString(),
    };

    await this.validateBookingRules(booking.location, mergedForValidation as CreateBookingDto, id);

    const mergedData: any = { ...updateBookingDto };
    if (mergedData.startTime) {
      mergedData.startTime = new Date(mergedData.startTime);
    }
    if (mergedData.endTime) {
      mergedData.endTime = new Date(mergedData.endTime);
    }
    Object.assign(booking, mergedData);
    return this.bookingRepository.save(booking);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
  }
}
