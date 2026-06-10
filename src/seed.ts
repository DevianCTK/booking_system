import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LocationsService } from './locations/locations.service';
import { LocationType } from './locations/enums/location-type.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const locationsService = app.get(LocationsService);

  console.log('Seeding data...');

  try {
    // Building A
    const buildingA = await locationsService.create({
      name: 'Building A',
      locationNumber: 'A',
      type: LocationType.BUILDING,
    });

    const bldAFloor1 = await locationsService.create({
      name: 'Floor 1',
      locationNumber: 'A-01',
      type: LocationType.FLOOR,
      parentId: buildingA.id,
    });

    await locationsService.create({ name: 'Lobby Level 1', locationNumber: 'A-01-Lobby', type: LocationType.ROOM, parentId: bldAFloor1.id });
    await locationsService.create({ name: 'Meeting Room 1', locationNumber: 'A-01-01', type: LocationType.ROOM, parentId: bldAFloor1.id, department: 'EFM', capacity: 10, openDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], openFrom: '09:00', openTo: '18:00' });
    await locationsService.create({ name: 'Meeting Room 2', locationNumber: 'A-01-02', type: LocationType.ROOM, parentId: bldAFloor1.id, department: 'FSS', capacity: 50, openDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], openFrom: '09:00', openTo: '18:00' });
    await locationsService.create({ name: 'Corridor Floor 1', locationNumber: 'A-01-Corridor', type: LocationType.ROOM, parentId: bldAFloor1.id });
    await locationsService.create({ name: 'Meeting Room 3', locationNumber: 'A-01-03', type: LocationType.ROOM, parentId: bldAFloor1.id, department: 'AVS', capacity: 5, openDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], openFrom: '09:00', openTo: '18:00' });

    // Building B
    const buildingB = await locationsService.create({
      name: 'Building B',
      locationNumber: 'B',
      type: LocationType.BUILDING,
    });

    const bldBFloor5 = await locationsService.create({
      name: 'Floor 5',
      locationNumber: 'B-05',
      type: LocationType.FLOOR,
      parentId: buildingB.id,
    });

    await locationsService.create({ name: 'Utility Room', locationNumber: 'B-05-11', type: LocationType.ROOM, parentId: bldBFloor5.id, department: 'ASS', capacity: 30, openDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], openFrom: '00:00', openTo: '23:59' });
    await locationsService.create({ name: 'Sanitary Room', locationNumber: 'B-05-12', type: LocationType.ROOM, parentId: bldBFloor5.id, department: 'EFM', capacity: 10, openDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], openFrom: '09:00', openTo: '18:00' });
    await locationsService.create({ name: 'Meeting Toilet', locationNumber: 'B-05-13', type: LocationType.ROOM, parentId: bldBFloor5.id, department: 'EFM', capacity: 10, openDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], openFrom: '09:00', openTo: '18:00' });
    await locationsService.create({ name: 'Genset Room', locationNumber: 'B-05-14', type: LocationType.ROOM, parentId: bldBFloor5.id, department: 'ASS', capacity: 100, openDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], openFrom: '09:00', openTo: '18:00' });
    await locationsService.create({ name: 'Pantry Floor 5', locationNumber: 'B-05-15', type: LocationType.ROOM, parentId: bldBFloor5.id });
    await locationsService.create({ name: 'Corridor Floor 5', locationNumber: 'B-05-Corridor', type: LocationType.ROOM, parentId: bldBFloor5.id });

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed. Ensure database is clean or locations dont already exist.', error);
  }

  await app.close();
}

bootstrap();
