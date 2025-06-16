import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CorporaSearchService } from '../services/corpora-search.service';
import {
  CorporaFilterSearchDto,
  elementSearchFilterDynamic,
} from '@unic/shared/corpora-dto';

@ApiTags('Corpora')
@Controller('corpora-search')
export class CorporaSearchController {
  constructor(private corporaSearchService: CorporaSearchService) {}

  @Post('search-corpora')
  async createRequestMetadata(@Body() filters: CorporaFilterSearchDto) {
    return await this.corporaSearchService.searchCorpora(filters);
  }

  @Get('get-corpora-filters')
  async getCorporaFilters(
    @Query('data_available') data_available?: boolean,
  ): Promise<elementSearchFilterDynamic> {
    const results = await this.corporaSearchService.getMetadataFilterDynamic(
      data_available || false,
    );

    return results;
  }
}
