import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('deals')
@Index(['hubspotId'], { unique: true })
@Index(['dealstage'])
@Index(['pipeline'])
@Index(['amount'])
@Index(['closedAt'])
@Index(['createdAt'])
@Index(['updatedAt'])
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'hubspot_id' })
  hubspotId: string;

  @Column({ nullable: true, name: 'deal_name' })
  dealName: string;

  @Column({ nullable: true })
  amount: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'amount_numeric' })
  amountNumeric: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  pipeline: string;

  @Column({ nullable: true })
  dealstage: string;

  @Column({ nullable: true, name: 'deal_type' })
  dealType: string;

  @Column({ nullable: true, name: 'associated_company_id' })
  associatedCompanyId: string;

  @Column({ nullable: true, name: 'associated_contact_ids', type: 'jsonb' })
  associatedContactIds: string[];

  @Column({ type: 'timestamp', nullable: true, name: 'closed_date' })
  closedDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'closed_at' })
  closedAt: Date;

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
