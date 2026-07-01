import { Module } from '@nestjs/common';

import { SearchController } from './controllers/search.controller';
import { SEARCH_PROVIDER } from './interfaces/search-provider.interface';
import { PrismaSearchProvider } from './providers/prisma-search.provider';
import { SearchRepository } from './repositories/search.repository';
import { SearchService } from './services/search.service';

import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SearchController],
  providers: [
    SearchRepository,
    PrismaSearchProvider,
    { provide: SEARCH_PROVIDER, useClass: PrismaSearchProvider },
    SearchService,
  ],
})
export class SearchModule {}
