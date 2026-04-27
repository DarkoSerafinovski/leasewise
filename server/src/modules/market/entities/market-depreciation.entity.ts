import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('market_depreciation')
export class MarketDepreciation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  category_name!: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  year_1_pct!: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  annual_avg_pct!: number;

  @Column({ default: false })
  is_appreciation!: boolean;

  @OneToMany(() => Asset, (asset) => asset.marketCategory)
  assets!: Asset[];
}
