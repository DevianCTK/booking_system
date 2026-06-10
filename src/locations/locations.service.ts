import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const { parentId, ...rest } = createLocationDto;
    
    let parent: Location | null = null;
    if (parentId) {
      parent = await this.locationRepository.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException(`Parent location with ID ${parentId} not found`);
      }
    }

    const location = this.locationRepository.create({
      ...rest,
      parent,
    });

    try {
      return await this.locationRepository.save(location);
    } catch (error) {
      if (error.code === '23505') { // Postgres unique violation
        throw new BadRequestException(`Location with number ${rest.locationNumber} already exists`);
      }
      throw error;
    }
  }

  async findAll(): Promise<Location[]> {
    // Return tree structure
    return this.locationRepository.find({
      where: { parent: IsNull() },
      relations: { children: { children: true } },
    });
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: { children: true, parent: true },
    });
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    const location = await this.findOne(id);
    
    const { parentId, ...rest } = updateLocationDto;
    
    if (parentId !== undefined) {
      if (parentId === null) {
        location.parent = null;
      } else {
        const parent = await this.locationRepository.findOne({ where: { id: parentId } });
        if (!parent) {
          throw new NotFoundException(`Parent location with ID ${parentId} not found`);
        }
        location.parent = parent;
      }
    }

    Object.assign(location, rest);
    
    try {
      return await this.locationRepository.save(location);
    } catch (error) {
      if (error.code === '23505') { // Postgres unique violation
        throw new BadRequestException(`Location with number ${location.locationNumber} already exists`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
  }
}
