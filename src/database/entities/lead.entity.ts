import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('leads')
@Index(['hubspotId'], { unique: true })
@Index(['email'])
@Index(['lifecycleStage'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'hubspot_id' })
  hubspotId: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true, name: 'first_name' })
  firstName: string;

  @Column({ nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, name: 'lifecycle_stage' })
  lifecycleStage: string;

  @Column({ nullable: true, name: 'lead_status' })
  leadStatus: string;

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true, name: 'hubspot_created_at' })
  hubspotCreatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'hubspot_updated_at' })
  hubspotUpdatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
