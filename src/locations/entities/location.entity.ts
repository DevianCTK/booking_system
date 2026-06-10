import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { LocationType } from '../enums/location-type.enum';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  locationNumber: string;

  @Column({ type: 'enum', enum: LocationType, nullable: true })
  type: LocationType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  department: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'varchar', array: true, nullable: true })
  openDays: string[];

  @Column({ type: 'time', nullable: true })
  openFrom: string;

  @Column({ type: 'time', nullable: true })
  openTo: string;

  @ManyToOne(() => Location, (location) => location.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent?: Location | null;

  @OneToMany(() => Location, (location) => location.parent)
  children: Location[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
