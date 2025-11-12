import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateLeadsAndDeals1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'leads',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'hubspot_id',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'first_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'last_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'company',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lifecycle_stage',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lead_status',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'properties',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'hubspot_created_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'hubspot_updated_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'leads',
      new TableIndex({
        name: 'IDX_LEADS_HUBSPOT_ID',
        columnNames: ['hubspot_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'leads',
      new TableIndex({
        name: 'IDX_LEADS_EMAIL',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'leads',
      new TableIndex({
        name: 'IDX_LEADS_LIFECYCLE_STAGE',
        columnNames: ['lifecycle_stage'],
      }),
    );

    await queryRunner.createIndex(
      'leads',
      new TableIndex({
        name: 'IDX_LEADS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'deals',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'hubspot_id',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'deal_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'amount_numeric',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'pipeline',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dealstage',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'deal_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'associated_company_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'associated_contact_ids',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'closed_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'closed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'properties',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'hubspot_created_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'hubspot_updated_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'deals',
      new TableIndex({
        name: 'IDX_DEALS_HUBSPOT_ID',
        columnNames: ['hubspot_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'deals',
      new TableIndex({
        name: 'IDX_DEALS_DEALSTAGE',
        columnNames: ['dealstage'],
      }),
    );

    await queryRunner.createIndex(
      'deals',
      new TableIndex({
        name: 'IDX_DEALS_PIPELINE',
        columnNames: ['pipeline'],
      }),
    );

    await queryRunner.createIndex(
      'deals',
      new TableIndex({
        name: 'IDX_DEALS_AMOUNT',
        columnNames: ['amount_numeric'],
      }),
    );

    await queryRunner.createIndex(
      'deals',
      new TableIndex({
        name: 'IDX_DEALS_CLOSED_AT',
        columnNames: ['closed_at'],
      }),
    );

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('deals', true);
    await queryRunner.dropTable('leads', true);
  }
}
