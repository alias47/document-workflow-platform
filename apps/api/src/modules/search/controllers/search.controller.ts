import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchService } from '../services/search.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Permissions('search.view')
  @ApiOperation({ summary: 'Global search across applicants, documents, and workflow' })
  @ApiResponse({ status: 200, description: 'Search results returned' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async search(@CurrentUser() user: JwtPayload, @Query() dto: SearchQueryDto) {
    const data = await this.searchService.search({
      query: dto.q,
      organizationId: user.organizationId,
      ...(dto.entity !== undefined ? { entity: dto.entity } : {}),
      page: dto.page ?? 1,
      pageSize: dto.pageSize ?? 20,
    });
    return { success: true, message: 'Search completed', data };
  }
}
